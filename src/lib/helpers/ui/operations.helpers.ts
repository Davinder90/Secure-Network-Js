import { SIDEBAR } from "@/src/lib/utils/ui/Sidebar.constant";

export const serviceInformation = (service: string, name: string) => {
    for(const service_category of SIDEBAR[name]){
        for(const $service of service_category['fields']){
            if (service.toUpperCase() === $service['path'].toUpperCase()){
                return $service;
            }
        }
    }  
}