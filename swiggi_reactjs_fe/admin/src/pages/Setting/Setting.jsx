import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSettings,
  updateSettings,
} from "../../features/setting/settingSlice";

const Setting = () => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state) => state.settings);
  const page = 2;
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    facebook: "",
    logo: "",
    favicon: "",
    x: "",
    youtube: "",
    instagram: "",
  });
  const [id, setId] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState(null);
  useEffect(() => {
    dispatch(
      fetchSettings({
        page,
      })
    );
  }, [dispatch, page]);
  const handleChange = (e) => {
    const { id, value, files } = e.target;
    if (id === "logo" && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        [id]: file,
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
    if (id === "favicon" && files.length > 0) {
      const file = files[0];
      setFormData((prevData) => ({
        ...prevData,
        [id]: file,
      }));
      setFaviconPreview(URL.createObjectURL(file));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [id]: value,
      }));
    }
  };
  useEffect(() => {
    if (settings.length > 0) {
      setId(settings[0]?.id);
      setFormData(settings[0]);
      console.log(faviconPreview == null)
    }
  }, [settings,faviconPreview]);
  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateSettings({ data: formData, id }));
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="row">
            <div className="col-md-12">
              <div className="card card-primary">
                <form onSubmit={handleSubmit}>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="title">Tiêu đề</label>
                          <input
                            type="text"
                            className="form-control"
                            id="title"
                            placeholder="Title"
                            defaultValue={settings[0]?.title || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="address">Địa chỉ</label>
                          <input
                            type="text"
                            className="form-control"
                            id="address"
                            onChange={handleChange}
                            defaultValue={settings[0]?.address || ""}
                            placeholder="Enter email"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="logo">Logo</label>

                          <div className="input-group">
                            <div className="custom-file">
                              <input
                                type="file"
                                className="custom-file-input"
                                id="logo"
                                onChange={handleChange}
                              />
                              <label
                                className="custom-file-label"
                                htmlFor="exampleInputFile"
                              >
                                Chọn file
                              </label>
                            </div>
                          </div>

                        
                            <img
                              src={
                                imagePreview == null
                                  ? settings[0]?.logo
                                  : imagePreview
                              }
                              alt="Food Preview"
                              width="100"
                              className="mt-2"
                            />
                           
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="favicon">Favicon</label>

                          <div className="input-group">
                            <div className="custom-file">
                              <input
                                type="file"
                                className="custom-file-input"
                                id="favicon"
                                onChange={handleChange}
                              />
                              <label
                                className="custom-file-label"
                                htmlFor="exampleInputFile"
                              >
                                Choose file
                              </label>
                            </div>
                          </div>

                          
                            <img
                              src={
                                faviconPreview == null
                                  ? settings[0]?.favicon
                                  : faviconPreview
                              }
                              alt="Food Preview"
                              width="100"
                              className="mt-2"
                            />
                          
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="facebook">Facebook</label>
                          <input
                            type="text"
                            className="form-control"
                            id="facebook"
                            placeholder="http://facebook.com"
                            defaultValue={settings[0]?.facebook || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="youtube">Youtube</label>
                          <input
                            type="text"
                            className="form-control"
                            id="youtube"
                            placeholder="http://youtube.com"
                            defaultValue={settings[0]?.youtube || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="x">X</label>
                          <input
                            type="text"
                            className="form-control"
                            id="x"
                            defaultValue={settings[0]?.x || ""}
                            onChange={handleChange}
                            placeholder="http://x.com"
                          />
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="instagram">Instagram</label>
                          <input
                            type="text"
                            className="form-control"
                            id="instagram"
                            placeholder="http://instagram.com"
                            defaultValue={settings[0]?.instagram || ""}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button
                      type="submit"
                      className="btn btn-success float-right"
                    >
                      Cập nhật
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Setting;
