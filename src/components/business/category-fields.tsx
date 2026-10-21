import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  isOtherCategory,
  sortCategoriesForSelect,
} from "@/lib/business/categories";
import { LIMITS } from "@/lib/constants";
import type { BusinessCategory } from "@/types";

export function BusinessCategoryFields({
  categories,
  categoryId,
  customCategory,
  onCategoryIdChange,
  onCustomCategoryChange,
  categoryError,
  customCategoryError,
  disabled,
  required,
  selectId = "business-category",
  customId = "business-custom-category",
}: {
  categories: BusinessCategory[];
  categoryId: string;
  customCategory: string;
  onCategoryIdChange: (categoryId: string) => void;
  onCustomCategoryChange: (customCategory: string) => void;
  categoryError?: string;
  customCategoryError?: string;
  disabled?: boolean;
  required?: boolean;
  selectId?: string;
  customId?: string;
}) {
  const sorted = sortCategoriesForSelect(categories);
  const selected = sorted.find((category) => category.id === categoryId);
  const showCustom = Boolean(selected && isOtherCategory(selected));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={selectId}>
          Category
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
        <Select
          name="categoryId"
          value={categoryId || null}
          onValueChange={(value) => onCategoryIdChange(value ?? "")}
          disabled={disabled}
          items={sorted.map((category) => ({
            value: category.id,
            label: category.name,
          }))}
        >
          <SelectTrigger
            id={selectId}
            className="w-full"
            aria-invalid={categoryError ? true : undefined}
          >
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent align="start" alignItemWithTrigger={false}>
            {sorted.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categoryError ? (
          <p className="text-sm text-destructive" role="alert">
            {categoryError}
          </p>
        ) : null}
      </div>

      {showCustom ? (
        <div className="space-y-2">
          <Label htmlFor={customId}>
            Your category
            {required ? <span className="text-destructive"> *</span> : null}
          </Label>
          <Input
            id={customId}
            name="customCategory"
            value={customCategory}
            onChange={(event) => onCustomCategoryChange(event.target.value)}
            placeholder="e.g. Pet sitting"
            maxLength={LIMITS.CUSTOM_CATEGORY_MAX_LENGTH}
            aria-invalid={customCategoryError ? true : undefined}
          />
          {customCategoryError ? (
            <p className="text-sm text-destructive" role="alert">
              {customCategoryError}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
