import mongoose from "mongoose";
import { dbConnection } from "@/src/config/dbConnection";
import { StatusCodes } from "http-status-codes";
import {
  asyncRequestHandler,
  generateResponseObject,
} from "@helpers/common.helper";
import { IResponseObject } from "@interfaces/api.interfaces";
import CategoryModel from "@models/category.model";
import ArticleModel from "@/src/models/article.model"; 
import {
  ICreateCategoryPayload,
  IUpdateCategoryPayload,
  IDeleteCategoryOptions,
} from "@interfaces/article/category.interface";
import { encryptId, decryptId } from "@/src/lib/helpers/crypto.helper"; 

/* -------------------------------------------------------------------------- */
/*                            GET ALL CATEGORIES                              */
/* -------------------------------------------------------------------------- */

/**
 * Retrieves all active categories (ordered by article count and creation date).
 * Replaces raw MongoDB _id with URL-safe encrypted tokens.
 */
export const getCategories = async (onlyActive: boolean = true) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const filter = onlyActive ? { isActive: true } : {};
      const categories = await CategoryModel.find(filter)
        .sort({
          isFeatured: -1,
          articleCount: -1,
          createdAt: -1,
        })
        .lean();

      // 🛡️ Map encrypted IDs and strip private _id
      const sanitizedCategories = categories.map((cat: any) => {
        const { _id, ...rest } = cat;
        return {
          ...rest,
          id: encryptId(_id),
          _id: encryptId(_id), // Backward-compatible alias for frontend keys
        };
      });

      return {
        message: "Categories fetched successfully",
        status_code: StatusCodes.OK,
        data: sanitizedCategories,
      };
    },
    "DATABASE_ERROR: Failed to fetch categories",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                              CREATE CATEGORY                               */
/* -------------------------------------------------------------------------- */

/**
 * Creates a new category and returns it with an encrypted ID.
 */
export const createCategory = async (payload: ICreateCategoryPayload) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const { name, description, icon, isFeatured } = payload;

      if (!name || name.trim().length === 0) {
        return {
          error: "Category name is required",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const normalizedSlug = (payload.slug || name)
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const existing = await CategoryModel.findOne({
        $or: [{ name: name.trim() }, { slug: normalizedSlug }],
      });

      if (existing) {
        return {
          error: "A category with this name or slug already exists",
          status_code: StatusCodes.CONFLICT,
        };
      }

      const newCategory = new CategoryModel({
        name: name.trim(),
        slug: normalizedSlug,
        description: description?.trim() || "",
        icon: icon?.trim() || "",
        isFeatured: Boolean(isFeatured),
      });

      await newCategory.save();

      const catObj = newCategory.toObject();
      const sanitized = {
        ...catObj,
        id: encryptId(newCategory._id),
        _id: encryptId(newCategory._id),
      };

      return {
        message: "Category created successfully",
        status_code: StatusCodes.CREATED,
        data: sanitized,
      };
    },
    "DATABASE_ERROR: Failed to create category",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                              UPDATE CATEGORY                               */
/* -------------------------------------------------------------------------- */

/**
 * Updates an existing category by ID (accepts encrypted token or raw ObjectId).
 */
export const updateCategory = async (
  categoryIdOrToken: string,
  updateData: IUpdateCategoryPayload
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const decryptedId = decryptId(categoryIdOrToken);
      const targetId = decryptedId || categoryIdOrToken;

      if (!targetId || !mongoose.isValidObjectId(targetId)) {
        return {
          error: "Invalid category ID",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      // If updating name, regenerate slug if not explicitly passed
      const updates: Record<string, unknown> = { ...updateData };
      if (updateData.name && !updateData.slug) {
        updates.slug = updateData.name
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
      }

      const updated = await CategoryModel.findByIdAndUpdate(
        targetId,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        return {
          error: "Category not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      const { _id, ...rest } = updated as any;

      return {
        message: "Category updated successfully",
        status_code: StatusCodes.OK,
        data: {
          ...rest,
          id: encryptId(_id),
          _id: encryptId(_id),
        },
      };
    },
    "DATABASE_ERROR: Failed to update category",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                              DELETE CATEGORY                               */
/* -------------------------------------------------------------------------- */

/**
 * Deletes or deactivates a category by its ID (accepts encrypted token or raw ObjectId).
 */
export const deleteCategory = async (
  categoryIdOrToken: string,
  options: IDeleteCategoryOptions = {}
) => {
  await dbConnection();

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const decryptedId = decryptId(categoryIdOrToken);
      const targetId = decryptedId || categoryIdOrToken;

      if (!targetId || !mongoose.isValidObjectId(targetId)) {
        return {
          error: "Invalid category ID format",
          status_code: StatusCodes.BAD_REQUEST,
        };
      }

      const category = await CategoryModel.findById(targetId);
      if (!category) {
        return {
          error: "Category not found",
          status_code: StatusCodes.NOT_FOUND,
        };
      }

      // Relational safety check: Check BOTH tag text and relational ObjectId reference
      if (!options.forceDelete) {
        const linkedArticlesCount = await ArticleModel.countDocuments({
          $or: [
            { category: category._id },
            { tags: category.name.toLowerCase() },
          ],
        });

        if (linkedArticlesCount > 0) {
          return {
            error: `Cannot delete category: ${linkedArticlesCount} article(s) are linked to '${category.name}'. Use soft-delete or reassign articles first.`,
            status_code: StatusCodes.CONFLICT,
          };
        }
      }

      // Soft Delete
      if (options.softDelete) {
        category.isActive = false;
        await category.save();

        return {
          message: `Category '${category.name}' deactivated successfully`,
          status_code: StatusCodes.OK,
          data: { id: encryptId(category._id), isActive: false },
        };
      }

      // Hard Delete
      await CategoryModel.findByIdAndDelete(category._id);

      return {
        message: `Category '${category.name}' deleted permanently`,
        status_code: StatusCodes.OK,
        data: { id: encryptId(category._id), deleted: true },
      };
    },
    "DATABASE_ERROR: Failed to delete category",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};

/* -------------------------------------------------------------------------- */
/*                          SEED DEFAULT CATEGORIES                           */
/* -------------------------------------------------------------------------- */

/**
 * Seeds baseline default network/tech categories if database is empty.
 */
export const seedDefaultCategories = async () => {
  await dbConnection();

  const defaultCategories = [
    { name: "Networking", description: "DNS, IP routing, subnetting, and connectivity probes.", isFeatured: true },
    { name: "DNS & DNSSEC", description: "Authoritative zones, resource records, and cryptographic trust chains.", isFeatured: true },
    { name: "Security Auditing", description: "TLS certificate checks, vulnerability discovery, and security headers.", isFeatured: true },
    { name: "API Testing", description: "HTTP mock runners, payload validation, and REST/GraphQL debugging.", isFeatured: true },
    { name: "Cloud & Kubernetes", description: "CNI plugins, overlay networks, ingress controllers, and VPC routing.", isFeatured: false },
    { name: "Protocols", description: "TCP, UDP, BGP, ICMP, and QUIC packet-level analysis.", isFeatured: false },
    { name: "Troubleshooting", description: "Latency resolution, packet loss diagnostics, and traceroute analysis.", isFeatured: false },
    { name: "Architecture", description: "Zero-trust network architecture, telemetry pipelines, and gateways.", isFeatured: false },
  ];

  const result = await asyncRequestHandler(
    async (): Promise<IResponseObject> => {
      const count = await CategoryModel.countDocuments();
      if (count > 0) {
        return {
          message: "Categories already seeded",
          status_code: StatusCodes.OK,
          data: { count },
        };
      }

      const inserted = await CategoryModel.insertMany(defaultCategories);

      const sanitized = inserted.map((cat: any) => ({
        ...cat.toObject(),
        id: encryptId(cat._id),
      }));

      return {
        message: "Default categories seeded successfully",
        status_code: StatusCodes.CREATED,
        data: sanitized,
      };
    },
    "DATABASE_ERROR: Failed to seed categories",
    StatusCodes.INTERNAL_SERVER_ERROR
  );

  return generateResponseObject(result as IResponseObject);
};
