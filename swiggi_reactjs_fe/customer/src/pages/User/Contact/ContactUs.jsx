import { useState } from "react";
import { useDispatch } from "react-redux";
import { createContact } from "../../../features/contact/contactSlice";

const ContactUs = () => {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createContact({ message }));
  };
  return (
    <div className="osahan-cart-item-profile bg-white rounded shadow-sm p-4">
      <div className="flex-column">
        <h6 className="font-weight-bold">Hãy cho chúng tôi biết về bạn</h6>
        <p className="text-muted">
          Cho dù bạn có thắc mắc hay bạn chỉ muốn chào hỏi, hãy liên hệ với
          chúng tôi.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label
              htmlFor="exampleFormControlTextarea1"
              className="small font-weight-bold"
            >
              CHÚNG TÔI CÓ THỂ GIÚP BẠN NHƯ THẾ NÀO?
            </label>
            <textarea
              className="form-control"
              id="exampleFormControlTextarea1"
              placeholder="Xin chào, tôi muốn..."
              rows="3"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            ></textarea>
            {errors.message && (
              <span className="text-danger">This field is required</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary btn-block">
            Xác nhận
          </button>
        </form>

        <div className="mapouter pt-3">
          <div className="gmap_canvas" style={{
            overflow: "hidden",
            background: "none!important",
            height: "300px",
            width: "100%",
          }}>
            <iframe
            width="100%"
            height="100%"
            src="https://www.google.com/maps?q=10.8506,106.7710&z=16&output=embed"
            frameBorder="0"
            scrolling="no"
            marginHeight="0"
            marginWidth="0"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
