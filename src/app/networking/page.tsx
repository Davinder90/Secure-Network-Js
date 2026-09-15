"use client";
import { Content_Block } from "@/src/lib/type/ui/inputFields/inputcomponent.types";
import { NETWORKING_CONTENT_BLOCK } from "@/src/lib/utils/ui/Networking.constant";



const ContentBlock = ({content}: {content: Content_Block}) => {
  return <div className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <img src={content.image_path} alt="Connectivity" className="w-12 h-12 mb-4"/>
          <h2 className="text-xl font-semibold text-black mb-2">{content.name}</h2>
          <p className="text-gray-600 text-sm">{content.description}</p>
        </div>
}

export default function Networking() {
  return (
    <div className="flex flex-col gap-12 p-6 md:p-12">
      
      <section className="flex flex-col md:flex-row items-center gap-8 bg-gray-100 rounded-lg p-8">
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-red-600">Networking Tools Hub</h1>
          <p className="text-gray-700 mt-4 text-lg">
            Monitor, inspect, and explore networks with our powerful suite of networking tools. From IP and DNS lookups to connectivity and web analysis, everything you need is in one place.
          </p>
        </div>
        <div className="flex-1 flex flex-col md:flex-row gap-4 justify-center">
          <img src="/networking.png" alt="Network Diagram" className="w-48 md:w-64 rounded-lg shadow-md"/>
          <img src="/internetglobe.png" alt="Server Globe" className="w-48 md:w-64 rounded-lg shadow-md"/>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {
          NETWORKING_CONTENT_BLOCK.map((content, index) => <ContentBlock key={index} content={content} />)
        }
      </section>
    </div>
  );
}
