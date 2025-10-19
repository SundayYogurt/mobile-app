
import React, { useEffect, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { Link } from "react-router";
const SucklingBreasts = () => {
     const [data, setData] = useState([]);
useEffect(() => {
     
    setData([
      { name: "วันที่ 1", time: 6, times: 10+" ครั้ง" },
      { name: "วันที่ 2", time: 7, times: 10+" ครั้ง"  },
      { name: "วันที่ 3", time: 4, times: 10+" ครั้ง"  },
      { name: "วันที่ 4", time: 8, times: 10+" ครั้ง"  },
      { name: "วันที่ 5", time: 6, times: 10+" ครั้ง"  },
      { name: "วันที่ 6", time: 6, times: 10+" ครั้ง" },
      { name: "วันที่ 7", time: 7, times: 10+" ครั้ง"  },
      { name: "วันที่ 8", time: 4, times: 10+" ครั้ง"  },
      { name: "วันที่ 9", time: 8, times: 10+" ครั้ง"  },
      { name: "วันที่ 10", time: 6, times: 10+" ครั้ง"  },
      { name: "วันที่ 11", time: 6, times: 10+" ครั้ง" },
      { name: "วันที่ 12", time: 7, times: 10+" ครั้ง"  },
      { name: "วันที่ 13", time: 4, times: 10+" ครั้ง"  },
      { name: "วันที่ 14", time: 8, times: 10+" ครั้ง"  },

    ]);
  }, []);


  return (
    <div className="w-full flex flex-col items-center justify-center mt-10 relative z-10 gap-6 px-6 max-w-[440px] mx-auto">
        <Link to={"/save"}>
      <button

        className="btn rounded-xl bg-[#F5D8EB] text-xl font-light w-full"
      >
        จับเวลาดูดนม
      </button>
        </Link>
      <BabyTable
        columns={["วันที่", "ระยะเวลาที่ลูกดูดนม(นาที)", " จำนวน ครั้ง / วัน"]}
        data={data}
      />


      <PinkGraph
        data={data}
        lines={[{ dataKey: "time", color: "#FF66C4", label: "จำนวน ครั้ง / วัน" }]}
      />

      <h1>การดูดนมอยู่ในเกณฑ์ที่ดีมาก</h1>
      <p></p>
      <div>
        <img src="/src/assets/weight/milk.jpg"></img>
      </div>
    </div>
  );
};

export default SucklingBreasts