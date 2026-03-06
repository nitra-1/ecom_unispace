import React from "react";
import {
  Cell,
  Label,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
} from "recharts";
import ShimmeringEffect from "../../../components/shimmering/ShimmeringEffect";
import {
  CustomizedLegend,
  replaceString,
} from "../../../lib/AllGlobalFunction";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";

const PaymentMethodChart = ({ orderCount, loading }) => {
  const data = [
    {
      name: replaceString("COD"),
      value: orderCount?.codCounts,
      color: "#d998a9",
    },
    {
      name: replaceString("Online"),
      value: orderCount?.onlineCounts,
      color: "#A4A6A4",
    },
  ];

  return loading ? (
    <ShimmeringEffect />
  ) : (
    <>
      <div
        style={{ boxShadow: "rgba(149, 157, 165, 0.2) 0px 8px 24px" }}
        className="pv-dashbord-chart-col pv-PieChart-main rounded h-100"
      >
        <Tabs defaultActiveKey="Payment" id="justify-tab-example" justify>
          <Tab className="border-0" eventKey="Payment" title="Payment">
            <ResponsiveContainer
              className="pv-piechart-main"
              width="100%"
              height={140}
            >
              <PieChart>
                <Pie
                  startAngle={180}
                  endAngle={0}
                  innerRadius={70}
                  outerRadius={110}
                  data={data}
                  dataKey="value"
                  labelLine={false}
                  blendStroke
                  isAnimationActive={false}
                  cy={"95%"}
                  cx={"52%"}
                >
                  {data?.length > 0 &&
                    data?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}

                  <Label
                    value={orderCount?.totalOrders}
                    position="centerBottom"
                    fill={"#000"}
                    fontSize={24}
                  />
                  <Label
                    style={{ transform: "translateY(16px)", fontWeight: 600 }}
                    value={"Payment Mode"}
                    position="centerTop"
                    fill={"#7E8299"}
                    fontSize={18}
                    y={200}
                    // className="fs-4"
                  />
                </Pie>

                <Legend
                  layout="vertical"
                  verticalAlign="bottom"
                  align="center"
                  content={<CustomizedLegend />}
                />
              </PieChart>
            </ResponsiveContainer>
          </Tab>
        </Tabs>
      </div>
      {/* <ResponsiveContainer
        className="pv-piechart-main"
        width="100%"
        height={250}
      >
        <PieChart width={400} height={250}>
          <Pie
            startAngle={180}
            endAngle={0}
            innerRadius={100}
            outerRadius={150}
            data={data?.paymentMethodData}
            dataKey="value"
            labelLine={false}
            blendStroke
            isAnimationActive={false}
            cy={"85%"}
            cx={"52%"}
          >
            {data?.paymentMethodData?.length > 0 &&
              data?.paymentMethodData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            <Label
              value={data?.totalPayments}
              position="centerBottom"
              fill={"#000"}
              fontSize={32}
            />
            <Label
              style={{ transform: "translateY(16px)", fontWeight: 600 }}
              value={"Payment Methods"}
              position="centerTop"
              fill={"#7E8299"}
              fontSize={22}
              y={200}
              // className="fs-4"
            />
          </Pie>

          <Legend
            layout="vertical"
            verticalAlign="bottom"
            align="center"
            content={<CustomizedLegend />}
          />
        </PieChart>
      </ResponsiveContainer>
       */}
    </>
  );
};

export default PaymentMethodChart;
