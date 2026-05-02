import { Radio } from "antd";
import { StatusLevel } from "@/features/booth/types";;
import styles from "./BoothStatusSelector.module.css";

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
      className={styles.radioBtn}
      style={{
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
      <p className={styles.label}>{label}</p>
      <Radio.Group
        value={value}
        onChange={(e) => onChange(e.target.value)}
        buttonStyle="solid"
        size="large"
        className={styles.radioGroup}
      >
        {options.map((text, i) => (
          <StatusButton key={i} value={i as StatusLevel} text={text} currentVal={value} />
        ))}
      </Radio.Group>
    </div>
  );
}
