import { useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";

interface Props {
  value?: string;
  onPickerChange: (color: string) => void;
}

const ColorPicker = ({ value, onPickerChange }: Props) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  return (
    <div className="color-picker relative">
      <div
        className="size-6 rounded cursor-pointer"
        style={{ backgroundColor: value || "#3B82F6" }}
        onClick={() => setIsPickerOpen(!isPickerOpen)}
      />
      <HexColorInput
        color={value}
        onChange={onPickerChange}
        className="hex-input"
        placeholder="#HEX"
        prefixed
      />
      <input
        type="color"
        value={value || "#3B82F6"}
        onChange={(e) => onPickerChange(e.target.value)}
        className="size-8 cursor-pointer bg-transparent"
      />

      {isPickerOpen && (
        <div className="hex-color-picker absolute z-50 mt-2">
          <HexColorPicker color={value} onChange={onPickerChange} />
        </div>
      )}
    </div>
  );
};

export default ColorPicker;
