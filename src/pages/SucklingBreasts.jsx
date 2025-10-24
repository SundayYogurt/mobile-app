import React, { useCallback, useEffect, useMemo, useState } from "react";
import PinkGraph from "../components/PinkGraph";
import BabyTable from "../components/BabyTable";
import { Link } from "react-router";
import { useAuthContext } from "../context/AuthContext";
import SelectedBabyService from "../services/SelectedBabyService";
import BabyService from "../services/BabyService";
import { info, success } from "../utils/alert";
import { countPerDayAlert } from "../utils/countAlert";
import Swal from "sweetalert2";

const SucklingBreasts = () => {
  const { user } = useAuthContext();
  const [rows, setRows] = useState([]);
  const [feedingAlert, setFeedingAlert] = useState(null);
  const [latestTimeInfo, setLatestTimeInfo] = useState(null);

  const uid = useMemo(() => user?.userId ?? user?.id ?? user?.sub, [user]);
  const selected = useMemo(() => (uid ? SelectedBabyService.get(uid) : null), [uid]);

  // ✅ คำนวณ daysAt (จากวันเกิด → วันที่บันทึก)
  const calcDaysAt = (birthDate, logDate) => {
    if (!birthDate || !logDate) return 1;
    const birth = new Date(birthDate);
    const log = new Date(logDate);
    const diff = Math.floor((log - birth) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // ✅ โหลดข้อมูล
  const loadLogs = useCallback(async () => {
    if (!uid || !selected?.id) {
      setRows([]);
      return;
    }

    try {
      const res = await BabyService.showBabyFeedingLogs(selected.id);
      const raw = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
        ? res.data.data
        : [];

      const mapped = raw.map((it, idx) => {
        const logDate = it?.date || it?.logDate || it?.createdAt || new Date();
        return {
          id: it?.id ?? it?._id ?? idx,
          daysAt: Number(it?.daysAt) || calcDaysAt(selected?.birthday, logDate),
          totalMinutes: Number(it?.totalMinutes ?? it?.durationMinutes ?? 0),
          count: Number(it?.logCount ?? it?.totalFeeding ?? it?.count ?? 1),
          logDate,
        };
      });

      setRows(mapped);

      // ✅ หา "วันล่าสุด"
      if (mapped.length > 0) {
        const latestDay = [...mapped].sort((a, b) => b.daysAt - a.daysAt)[0];
        const latestDayNum = latestDay.daysAt;
        const latestCount = latestDay.count;
        const latestMinutes = latestDay.totalMinutes;

        // ✅ เวลาล่าสุด
        const latestTime = new Date(latestDay.logDate).toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        });

        setLatestTimeInfo({
          time: latestTime,
          minutes: latestMinutes,
          count: latestCount,
          day: latestDayNum,
        });

        // ✅ แจ้งเตือนจากวันล่าสุด
        if (latestCount < 8) {
          setFeedingAlert(
            `ลูกดูดนมน้อยกว่า 8 ครั้งใน 24 ชั่วโมง (${latestCount} ครั้ง) อาจได้รับนมไม่เพียงพอ 💧`
          );
        } else if (latestCount > 12) {
          setFeedingAlert(
            `ลูกดูดนมบ่อยกว่า 12 ครั้งใน 24 ชั่วโมง (${latestCount} ครั้ง) แนะนำให้สังเกตการเข้าเต้าและการกลืนของลูก 👶`
          );
        } else {
          setFeedingAlert(null);
        }
      } else {
        setFeedingAlert(null);
        setLatestTimeInfo(null);
      }
    } catch (err) {
     
      setRows([]);
    }
  }, [uid, selected?.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ✅ ตาราง 14 วัน (แสดงแน่ๆ)
  const tableData = useMemo(() => {
    const dataByDay = rows.reduce((acc, row) => {
      acc[row.daysAt] = row;
      return acc;
    }, {});

    const arr = [];
    for (let i = 1; i <= 14; i++) {
      const row = dataByDay[i];
      if (row) {
        arr.push({
          daysAt: i,
          "รวมเวลานาทีต่อวัน": row.totalMinutes,
          "จำนวนครั้งต่อวัน": row.count,
          Actions: (
            <button
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#f782c0] hover:to-[#ff6bbf] text-[#6C3B73] font-semibold text-xs sm:text-sm px-3 py-[6px] rounded-full shadow-md transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95 w-full sm:w-auto"
              onClick={async () => {
                const { value: formValues } = await Swal.fire({
                  title: `แก้ไขข้อมูลวันที่ ${i}`,
                  width: "80%",
                  position: "center",
                  customClass: { popup: "swal2-responsive" },
                  html: `
                    <style>
                      .swal2-input {
                        box-sizing: border-box !important;
                        width: calc(100% - 20px) !important;
                        padding: 10px !important;
                        margin: 6px 10px !important;
                      }
                      label {
                        margin-left: 10px !important;
                      }
                    </style>
                    <div style="display:flex;flex-direction:column;gap:10px;text-align:left">
                      <label>รวมเวลานาทีต่อวัน:</label>
                      <input id="swal-minutes" type="number" value="${row.totalMinutes}" class="swal2-input" placeholder="เช่น 30">
                      <label>จำนวนครั้งต่อวัน:</label>
                      <input id="swal-count" type="number" value="${row.count}" class="swal2-input" placeholder="เช่น 8">
                    </div>
                  `,
                  focusConfirm: false,
                  showCancelButton: true,
                  confirmButtonText: "บันทึก",
                  cancelButtonText: "ยกเลิก",
                  confirmButtonColor: "#C266A4",
                  cancelButtonColor: "#aaa",
                  preConfirm: () => {
                    const minutes = document.getElementById("swal-minutes").value;
                    const count = document.getElementById("swal-count").value;
                    if (!minutes || !count || minutes <= 0 || count <= 0) {
                      Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบและถูกต้อง");
                      return false;
                    }
                    return { minutes: Number(minutes), count: Number(count) };
                  },
                });

                if (!formValues) return;

                try {
                  await BabyService.updateBabyFeedingLog(selected.id, row.id, {
                    durationMinutes: formValues.minutes,
                    totalFeeding: formValues.count,
                    userId: uid,
                  });
                  await loadLogs();
                  success("อัปเดตข้อมูลเรียบร้อยแล้ว");
                } catch (err) {
                
                  info("อัปเดตไม่สำเร็จ");
                }
              }}
            >
              แก้ไข
            </button>
          ),
        });
      } else {
        arr.push({
          daysAt: i,
          "รวมเวลานาทีต่อวัน": "-",
          "จำนวนครั้งต่อวัน": "-",
          Actions: (
            <button
              className="inline-flex items-center justify-center bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#FF9ED1] hover:to-[#FF80C8] text-[#6C3B73] font-semibold text-xs sm:text-sm px-3 py-[6px] rounded-full shadow-md transition-all duration-200 whitespace-nowrap hover:scale-105 active:scale-95"
              onClick={async () => {
                const result = await countPerDayAlert({
                  title: `เพิ่มข้อมูลวันที่ ${i}`,
                  label: "กรอกเวลาปั๊มนม (นาที)",
                  placeholder: "เช่น 30",
                  confirmText: "เพิ่มข้อมูล",
                  cancelText: "ยกเลิก",
                  invalidMessage: "กรุณากรอกเวลามากกว่า 0 นาที",
                });

                if (result) {
                  try {
                    await BabyService.createBabyFeedingLog(selected.id, {
                      durationMinutes: result.count,
                      userId: uid,
                      daysAt: i,
                    });
                    await loadLogs();
                    success("เพิ่มข้อมูลสำเร็จ");
                  } catch (e) {
                  
                    info("เพิ่มไม่สำเร็จ");
                  }
                }
              }}
            >
              💕 เพิ่มข้อมูล
            </button>
          ),
        });
      }
    }
    return arr;
  }, [rows, uid, selected?.id, loadLogs]);

  // ✅ ข้อมูลกราฟ
  const graphData = useMemo(
    () =>
      rows.map((d) => ({
        name: `วันที่ ${d.daysAt}`,
        minutes: d.totalMinutes,
        times: d.count,
      })),
    [rows]
  );

  return (
    <div className="w-full flex flex-col items-center justify-center mt-8 relative z-10 gap-6 px-4 sm:px-6 md:px-10 max-w-[800px] mx-auto">
      {/* หัวข้อ */}
      <div className="flex flex-col items-center text-center mb-4 px-2">
        <img src="/src/assets/love.png" alt="icon" className="w-14 h-14 sm:w-16 sm:h-16 animate-pulse mb-2" />
        <h1 className="text-2xl sm:text-3xl font-bold text-[#FF66C4] drop-shadow-sm">
          บันทึกการดูดนมแม่ 💕
        </h1>
        <p className="text-gray-500 text-sm sm:text-base mt-1">
          จดบันทึกเวลาการให้นมลูกน้อย เพื่อดูพัฒนาการและสุขภาพของลูก 🌸
        </p>
      </div>

      {/* ปุ่มบันทึกเพิ่มเติม */}
      <Link to={"/save"} className="w-full">
        <button className="btn w-full text-sm sm:text-base rounded-xl bg-gradient-to-r from-[#F5D8EB] to-[#F8CFE5] hover:from-[#f782c0] hover:to-[#ff6bbf] text-[#6C3B73] font-semibold shadow-md transition-all hover:scale-105 py-3 sm:py-4">
          บันทึกการปั๊มนมเพิ่มเติม
        </button>
      </Link>

      {/* 🕒 การให้นมล่าสุด */}
      {latestTimeInfo && (
        <div className="w-full text-center bg-[#FFF0F6] border border-pink-200 rounded-xl px-4 py-3 shadow-sm">
          <p className="text-[#6C3B73] text-sm sm:text-base font-medium">
            🕒 การให้นมล่าสุด (วันที่ {latestTimeInfo.day}):{" "}
            <span className="font-semibold text-[#FF66C4]">
              {latestTimeInfo.time}
            </span>{" "}
            รวม {latestTimeInfo.minutes} นาที ({latestTimeInfo.count} ครั้ง)
          </p>
        </div>
      )}

      {/* คำเตือน */}
      {feedingAlert && (
        <div className="w-full max-w-[640px] mx-auto px-2 sm:px-4">
          <div className="text-[#6C3B73] text-sm sm:text-base font-semibold mb-2">คำเตือนสำคัญ</div>
          <div
            className={`rounded-lg px-4 py-3 text-sm sm:text-base shadow-sm mb-2 ${
              feedingAlert.includes("น้อยกว่า")
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            }`}
          >
            <strong className="font-semibold">การดูดนม: </strong>
            {feedingAlert}
          </div>
        </div>
      )}

      {/* ตาราง */}
      <div className="w-full overflow-x-auto">
        <div className="min-w-[360px] sm:min-w-full">
          <BabyTable
            columns={[
              { key: "daysAt", label: "อายุของทารก (วัน)" },
              "รวมเวลานาทีต่อวัน",
              "จำนวนครั้งต่อวัน",
              "Actions",
            ]}
            data={tableData}
          />
        </div>
      </div>

      {/* กราฟ */}
      {rows.length > 0 && (
        <div className="w-full sm:w-[90%] md:w-[80%] h-[300px] sm:h-[400px]">
          <PinkGraph
            data={graphData}
            lines={[
              { dataKey: "times", color: "#FF66C4", label: "จำนวนครั้งต่อวัน" },
              { dataKey: "minutes", color: "#CB6CE6", label: "รวมนาทีต่อวัน" },
            ]}
          />
        </div>
      )}

      <h1 className="text-base sm:text-lg text-[#E2A9F1] font-medium mt-4 text-center">
        ให้นมแม่สม่ำเสมอช่วยให้ลูกน้อยแข็งแรง 💕
      </h1>
      <img
        src="/src/assets/weight/milk.jpg"
        alt="breastfeeding info"
        className="rounded-lg shadow-md w-[90%] sm:w-[400px] md:w-[500px] mt-2"
      />
    </div>
  );
};

export default SucklingBreasts;
