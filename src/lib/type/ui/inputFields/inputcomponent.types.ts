export type Content_Block = {
    name: string,
    description: string,
    image_path: string
}

export type Input_Container_Fields = {
    name: string,
    value: string | number | string[]
    placeholder: string,
    type: string,
    caption: string
    regex?: string,
}

export type Select_Container_Fields = {
    name: string,
    defaultValue: string | number,
    items: (number | string)[]
}

export type Checkbox_Container_Record_Categories = {
  name: string;
  items: string[];       
  selectedItems: string[];
  caption?: string;
};
