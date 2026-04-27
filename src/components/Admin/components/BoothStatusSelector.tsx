import { Radio } from "antd";
import { StatusLevel } from "@/lib/Server/api";

interface BoothStatusSelectorProps {
  label: string;
  value: StatusLevel;
  onChange: (val: StatusLevel) => void;
  options: string[];
}

const StatusButton = ({ value, text, currentVal }: { value: StatusLevel; text: string; currentVal: StatusLevel }) => {
  const colors = ["#52c41a", "#faad14", "#ff4d4f"];
  return (
    <Radio.Button
      value={value}
      style={{
        width: "33.3%",
        textAlign: "center",
        background: currentVal === value ? colors[value] : "",
      }}
    >
      {text}
    </Radio.Button>
  );
};

export default function BoothStatusSelector({ label, value, onChange, options }: BoothStatusSelectorProps) {
  return (
    <div>
      <p style={{ marginBottom: "12px", fontWeight: "bold", textAlign: "left" }}>{label}</p>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="large"
        style={{ width: "100%" }}
      >
        {options.map((text, i) => (
          <StatusButton key={i} value={i as StatusLevel} text={text} currentVal={value} />
        ))}
      </Radio.Group>
    </div>
  );
}
