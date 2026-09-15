import { IconType } from "react-icons"

export type SideBar_Item_Field = {
    name: string,
    path: string,
    description: string,
    logo: string | IconType
}

export type SideBar_Item = {
    name: string,
    fields: SideBar_Item_Field[]
} 
