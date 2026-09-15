import { Schema, model, models } from "mongoose";

export interface ICollection {
  name: string;
  description?: string;
  createdBy?: string;
  favorite?: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    favorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const CollectionModel =
  models.Collection || model<ICollection>("Collection", collectionSchema);

export default CollectionModel;