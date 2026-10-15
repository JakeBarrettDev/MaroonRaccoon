"""Repair a Meshy auto-rigged Packet export before optimizing it for the web.

Usage: python3 -I fix_packet.py <input.glb> <output.glb>

What it fixes (all specific to Meshy's auto-rig/animation export):
  1. Skin weights: Meshy binds much of the head (cheeks, even ears) to the shoulder
     and arm bones, so arm-heavy clips like Running warp the face. Everything above
     the neck is moved onto the Head bone, blending through the collar.
  2. Loop timing: rotation tracks run at 30 fps from 0.033s while the hips track runs
     at 24 fps from 0s with a slightly longer length, so loops stall for a frame.
     Every track is re-timed onto the same 0..N loop.
  3. Drops the empty "Armature|clip0|baselayer" clip Meshy adds.

Then run build_packet.sh (or the gltf-transform steps in it) on the output.
"""
import json
import struct
import sys

# Heights in the mesh's bind space (model is ~1.18 tall): the Head joint sits at
# ~0.76 and the shoulders at ~0.69. Below BLEND_START weights are untouched; above
# BLEND_END the vertex follows the head only.
BLEND_START = 0.74
BLEND_END = 0.80

CT = {5121: ("B", 1), 5123: ("H", 2), 5126: ("f", 4)}
NCOMP = {"SCALAR": 1, "VEC2": 2, "VEC3": 3, "VEC4": 4, "MAT4": 16}


def smoothstep(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def main(src, dst):
    data = bytearray(open(src, "rb").read())
    json_len = struct.unpack_from("<I", data, 12)[0]
    gltf = json.loads(data[20 : 20 + json_len])
    bin_start = 20 + json_len + 8
    acc = gltf["accessors"]
    views = gltf["bufferViews"]

    def layout(ai):
        a = acc[ai]
        bv = views[a["bufferView"]]
        n = NCOMP[a["type"]]
        fmt, size = CT[a["componentType"]]
        stride = bv.get("byteStride", n * size)
        offset = bin_start + bv.get("byteOffset", 0) + a.get("byteOffset", 0)
        return a["count"], n, fmt, stride, offset

    def read(ai):
        count, n, fmt, stride, offset = layout(ai)
        return [list(struct.unpack_from(f"<{n}{fmt}", data, offset + i * stride)) for i in range(count)]

    def write(ai, rows):
        count, n, fmt, stride, offset = layout(ai)
        for i, row in enumerate(rows):
            struct.pack_into(f"<{n}{fmt}", data, offset + i * stride, *row)

    # ---- 1. Skin weights -------------------------------------------------------
    skin = gltf["skins"][0]
    names = [gltf["nodes"][j]["name"].replace("mixamorig:", "") for j in skin["joints"]]
    head = names.index("Head")
    prim = gltf["meshes"][0]["primitives"][0]["attributes"]
    positions = read(prim["POSITION"])
    joints = read(prim["JOINTS_0"])
    weights = read(prim["WEIGHTS_0"])
    moved = 0
    for i, pos in enumerate(positions):
        t = smoothstep(BLEND_START, BLEND_END, pos[1])
        if t <= 0:
            continue
        mix = {}
        for j, w in zip(joints[i], weights[i]):
            if w > 0:
                mix[j] = mix.get(j, 0.0) + w * (1 - t)
        mix[head] = mix.get(head, 0.0) + t
        top = sorted(mix.items(), key=lambda kv: -kv[1])[:4]
        total = sum(w for _, w in top)
        top += [(0, 0.0)] * (4 - len(top))
        joints[i] = [j for j, _ in top]
        weights[i] = [w / total for _, w in top]
        moved += 1
    write(prim["JOINTS_0"], joints)
    write(prim["WEIGHTS_0"], weights)
    print(f"reweighted {moved} of {len(positions)} vertices toward Head")

    # ---- 2. Loop timing --------------------------------------------------------
    gltf["animations"] = [a for a in gltf["animations"] if "baselayer" not in a["name"]]
    for anim in gltf["animations"]:
        inputs = sorted({s["input"] for s in anim["samplers"]})
        # The 30 fps rotation timeline defines the loop: shift it to start at 0.
        offset_inputs = [i for i in inputs if acc[i]["min"][0] > 0]
        start = min(acc[i]["min"][0] for i in offset_inputs) if offset_inputs else 0.0
        length = max(acc[i]["max"][0] for i in offset_inputs) - start if offset_inputs else None
        for ai in inputs:
            times = read(ai)
            lo, hi = acc[ai]["min"][0], acc[ai]["max"][0]
            if ai in offset_inputs:
                times = [[t[0] - start] for t in times]
            elif length and hi > 0:
                # Other timelines (the 24 fps hips track) get stretched to the same length.
                times = [[t[0] / hi * length] for t in times]
            write(ai, times)
            acc[ai]["min"] = [min(t[0] for t in times)]
            acc[ai]["max"] = [max(t[0] for t in times)]
        print(f"{anim['name']}: loop 0..{length:.4f}s (was offset {start:.4f}s)")

    # ---- write -----------------------------------------------------------------
    new_json = json.dumps(gltf, separators=(",", ":")).encode()
    new_json += b" " * (-len(new_json) % 4)
    rest = data[20 + json_len :]
    out = bytearray(struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(new_json) + len(rest)))
    out += struct.pack("<II", len(new_json), 0x4E4F534A) + new_json + rest
    open(dst, "wb").write(out)
    print(f"wrote {dst}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
