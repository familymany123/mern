import {
  ArcElement,
  Tooltip,
  Legend,
  Title,
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement
} from "chart.js";
import React, { useEffect, useState } from "react";
import { Pie, Line } from "react-chartjs-2";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentOrderCount } from "../../features/statistic/currentOrderSlice";
import { fetchCurrentRevenue } from "../../features/statistic/currentRevenueSlice";
import { fetchMonthlyOrderCount } from "../../features/statistic/monthlyOrderSlice";
import { fetchMonthlyRevenue } from "../../features/statistic/monthlyRevenueSlice";
import API_BASE_URL from "../../api/config";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, PointElement, LineElement);

const Home = () => {
  const [orderData, setOrderData] = useState([]);
  const [foodData, setFoodData] = useState([]);
  const dispatch = useDispatch();
  const monthlyRevenue = useSelector((state) => state.monthlyRevenue);
  const monthlyOrder = useSelector((state) => state.monthlyOrder);
  const currentRevenue = useSelector((state) => state.currentRevenue);
  const currentOrder = useSelector((state) => state.currentOrder);
  const currentYear = new Date().getFullYear();
  const [orderStatusData, setOrderStatusData] = useState([]);
  const [orderStatusRange, setOrderStatusRange] = useState("today");
  const [month, setMonth] = useState(new Date().getMonth() + 1); // Tháng mặc định là tháng hiện tại
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    dispatch(fetchMonthlyRevenue());
    dispatch(fetchMonthlyOrderCount());
    dispatch(fetchCurrentRevenue());
    dispatch(fetchCurrentOrderCount());
  }, [dispatch]);

  useEffect(() => {
    const fetchOrderStatusData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/statistics/percent?range=${orderStatusRange}`);
        const data = await response.json();
        setOrderStatusData(data.result || []);
      } catch (error) {
        console.error("Error fetching order status data:", error);
      }
    };

    fetchOrderStatusData();
  }, [orderStatusRange]);


  useEffect(() => {
    console.log(month)
    // Fetch API phần trăm trạng thái đơn hàng
    const fetchRevenueData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/statistics/revenue_day_of_month?month=${month}`);
        const data = await response.json();
        const days = data.revenueByDay.map(item => item.day);
        const revenues = data.revenueByDay.map(item => item.totalRevenue);
        setRevenueData({ days, revenues });
      } catch (error) {
        console.error("Error fetching order status data:", error);
      }
    };
    fetchRevenueData();
  }, [month]);

  // Kết hợp dữ liệu dựa trên "month"
  const combinedData = monthlyRevenue.map((revenue) => {
  const orderData = monthlyOrder.find((order) => order.month === revenue.month) || { orderCount: 0 };
    return {
      month: revenue.month,
      totalRevenue: revenue.totalRevenue,
      orderCount: orderData.orderCount,
    };
  });

  const orderStatusColors = {
    Pending: "#FFC300",
    Processing: "#3399FF",
    Completed: "#33FF57",
    Cancelled: "#FF5733",
    "Ch? x? l�": "#FFC300",
    "�ang x? l�": "#3399FF",
    "Ho�n th�nh": "#33FF57",
    "�� h?y": "#FF5733",
  };

  const chartData = {
    labels: orderStatusData.map((item) => item.status),
    datasets: [
      {
        data: orderStatusData.map((item) => parseFloat(item.percent)),
        backgroundColor: orderStatusData.map((item) => orderStatusColors[item.code || item.status] || "#6C757D"),
        borderColor: "#fff",
        borderWidth: 1,
      },
    ],
  };

  const reData = {
    labels: revenueData.days, // Ngày
    datasets: [
      {
        label: 'Doanh Thu',
        data: revenueData.revenues, // Doanh thu
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Ngày',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Doanh Thu (VND)',
        },
        beginAtZero: true,
      },
    },
  };

  const handleMonthChange = (event) => {
    setMonth(event.target.value);
  };
  return (
    <div className="container pt-2">
      <div className="row">
        <div className="col-lg-4 col-6">
          {/* small box */}
          <div className="small-box bg-info">
            <div className="inner">
              <h3>{currentRevenue.dailyRevenue || 0}đ</h3>
              <p>Doanh Thu Hôm Nay</p>
            </div>
            <div className="icon">
              <i className="ion ion-bag" />
            </div>
          </div>
        </div>
        {/* ./col */}
        <div className="col-lg-4 col-6">
          {/* small box */}
          <div className="small-box bg-success">
            <div className="inner">
              <h3>{currentRevenue.weeklyRevenue || 0}đ</h3>
              <p>Doanh Thu Tuần Nay</p>
            </div>
            <div className="icon">
              <i className="ion ion-stats-bars" />
            </div>
          </div>
        </div>
        {/* ./col */}
        <div className="col-lg-4 col-6">
          {/* small box */}
          <div className="small-box bg-warning">
            <div className="inner">
              <h3>{currentRevenue.monthlyRevenue || 0}đ</h3>
              <p>Doanh Thu Tháng Nay</p>
            </div>
            <div className="icon">
              <i className="ion ion-person-add" />
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <section className="col-lg-6 connectedSortable ui-sortable">
          <div className="card bg-gradient-white">
            <div className="card-header border-0 d-flex align-items-center justify-content-between">
              <h3 className="card-title">
                <i className="fas fa-th mr-1" />
                Các Đơn Hàng
              </h3>
              <select
                className="form-control col-md-4"
                value={orderStatusRange}
                onChange={(event) => setOrderStatusRange(event.target.value)}
              >
                <option value="today">Hom nay</option>
                <option value="month">Thang nay</option>
                <option value="all">Tat ca</option>
              </select>
            </div>
            <div className="card-body">
              <div
                className="table-responsive"
                style={{
                  maxHeight: "300px",
                  display: "flex",
                  justifyContent: "center",  // Căn giữa theo chiều ngang
                  alignItems: "center",      // Căn giữa theo chiều dọc
                  height: "100%",            // Đảm bảo phần div chiếm toàn bộ chiều cao của parent
                }}
              >
                {orderStatusData.length > 0 ? (
                  <Pie data={chartData} options={{ responsive: true }} />
                ) : (
                  <p>Khong co du lieu don hang</p>
                )}
              </div>
            </div>
          </div>
        </section>
        <section className="col-lg-6 connectedSortable ui-sortable">
          {/* solid sales graph */}
          <div className="card bg-gradient-white">
            <div className="card-header border-0">
              <h3 className="card-title">
                <i className="fas fa-th mr-1" />
                Doanh Thu Theo Tháng
              </h3>
            </div>
            <div className="card-body">
              <div
                className="table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }} // Giới hạn chiều cao
              >
                <table className="table">
                  <thead>
                    <tr>
                      <th>Tháng</th>
                      <th>Doanh Thu</th>
                      <th>Số Đơn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {combinedData.map((data) => (
                      <tr key={data.month}>
                        <td>Tháng {data.month} năm {currentYear}</td>
                        <td>{data.totalRevenue.toLocaleString()} đ</td>
                        <td>{data.orderCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          {/* /.card */}
        </section>
      </div>

      <div className="row">
        <section className="col-lg-12 connectedSortable ui-sortable">
          <div className="card bg-gradient-white">
            <div className="card-header border-0">
              <h3 className="card-title">
                <i className="fas fa-th mr-1" />
                Biểu Đồ Doanh Thu Theo Ngày
              </h3>
            </div>
            <div className="card-body">
              <div>
                <div>
                  <select className="form-control col-md-2 float-right" id="monthSelect" value={month} onChange={handleMonthChange}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((monthValue) => (
                      <option key={monthValue} value={monthValue}>
                        Tháng {monthValue}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ width: '100%' }}>
                  <Line data={reData} options={options} style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;

