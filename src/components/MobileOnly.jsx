import { useEffect, useState } from "react";

function isMobileOrTabletUA() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  const isIpadOS13Plus =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const match = /(Mobi|Android|iPhone|iPad|iPod|Tablet|Silk|Kindle|PlayBook|BB10|RIM Tablet OS)/i.test(
    ua
  );
  const uaDataMobile = navigator.userAgentData?.mobile === true;
  return match || isIpadOS13Plus || uaDataMobile;
}

export default function MobileOnly({ children }) {
  const [allowed, setAllowed] = useState(true);

  useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      const isSmallOrTabletWidth = width < 1280; // allow up to < xl (incl. most tablets)
      setAllowed(isSmallOrTabletWidth || isMobileOrTabletUA());
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  if (allowed) {
    return <div className="min-h-screen bg-base-100">{children}</div>;
  }

  return (
    <div className="min-h-screen  flex items-center justify-center p-6 bg-base-200 text-base-content">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">รองรับเฉพาะมือถือและแท็บเล็ต</h1>
        <p>
          แอปนี้ออกแบบมาสำหรับอุปกรณ์พกพา (มือถือ/แท็บเล็ต) เท่านั้น กรุณาเปิดด้วย
          อุปกรณ์ดังกล่าว หรือย่อขนาดหน้าต่างให้เล็กลง
        </p>
      </div>
    </div>
  );
}
