import { ICategoryModel } from "@models/category.model";

// 1. Pick creation fields and keep 'name' required
export interface ICreateCategoryPayload
  extends Pick<ICategoryModel, "name">,
    Partial<Pick<ICategoryModel, "slug" | "description" | "icon" | "isFeatured">> {}

// 2. Derive update payload with all fields optional
export interface IUpdateCategoryPayload
  extends Partial<Pick<ICategoryModel, "name" | "slug" | "description" | "icon" | "isFeatured" | "isActive" >> {}

export interface IDeleteCategoryOptions {
  forceDelete?: boolean; // If true, hard deletes even if articles exist
  softDelete?: boolean;  // If true, sets isActive = false rather than dropping document
}