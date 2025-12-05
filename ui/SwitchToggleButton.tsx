type SwitchToggleBtnPropType = {
  inputId: string;
  onChange?: (value: boolean) => void;
  checked?: boolean;
};

function SwitchToggleButton({
  inputId,
  onChange,
  checked,
}: SwitchToggleBtnPropType) {
  const toggleHandle = (value: boolean) => {
    if (onChange) {
      onChange(value);
    }
  };
  return (
    <div className="relative inline-block w-9 h-5">
      <input
        id={inputId}
        type="checkbox"
        className="peer appearance-none w-9 h-[1.3rem] bg-Gray-100 rounded-full checked:bg-brand-600-orange-p-1 cursor-pointer transition-colors duration-300 p-0.5"
        checked={checked}
        onChange={(event) => toggleHandle(event.target.checked)}
      />
      <label
        htmlFor={inputId}
        className="absolute top-1/2 left-0.5 w-4 h-4 bg-white rounded-full shadow-shadow-sm transition-transform duration-300 transform -translate-y-1/2 peer-checked:translate-x-4 cursor-pointer"
      ></label>
    </div>
  );
}

export default SwitchToggleButton;
