import PawPrint from "./PawPrint";

const values = [
  "Hand-coded",
  "Mobile-first",
  "No templates",
  "Transparent pricing",
  "Fast by default",
  "Built to last",
];

function Row({ hidden = false }) {
  return (
    <div className="marquee-row" aria-hidden={hidden || undefined}>
      {values.map((value) => (
        <span key={value} className="marquee-item">
          {value}
          <PawPrint size={20} className="marquee-paw" />
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div className="marquee">
      <div className="marquee-track">
        <Row />
        <Row hidden />
      </div>
    </div>
  );
}
