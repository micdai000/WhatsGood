import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface RememberMeCheckboxProps {
  id?: string;
  name?: string;
  defaultChecked?: boolean;
}

export function RememberMeCheckbox({
  id = "remember",
  name = "remember",
  defaultChecked,
}: RememberMeCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} name={name} defaultChecked={defaultChecked} />
      <Label htmlFor={id} className="font-normal">
        Remember me
      </Label>
    </div>
  );
}
