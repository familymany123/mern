import { Link } from 'react-router-dom'

const Term = () => {
  return (
    <>
      <div className='osahan-privacy bg-white rounded shadow-sm p-4'>
        <div id='giới-thiệu' className='mb-4'>
          <div className='mb-3'>
            <h2 className='h5 text-primary'>Chào mừng đến với Swiggiweb</h2>
          </div>

          <p>
            Cảm ơn bạn đã sử dụng các sản phẩm và dịch vụ (&quot;Dịch vụ&quot;) của chúng tôi. Các Dịch vụ được cung cấp bởi
            Pixeel Ltd. (&quot;Swiggiweb&quot;), trụ sở tại 153 Williamson Plaza, Maggieberg, MT 09514, Anh, Vương quốc Anh.
          </p>
          <p>Bằng cách sử dụng Dịch vụ của chúng tôi, bạn đồng ý với các điều khoản này. Vui lòng đọc kỹ.</p>
        </div>
        <div id='dịch-vụ' className='mb-4'>
          <div className='mb-3'>
            <h3 className='h5 text-primary'>1. Sử dụng dịch vụ của chúng tôi</h3>
          </div>

          <p>Bạn phải tuân theo bất kỳ chính sách nào được cung cấp cho bạn trong các Dịch vụ.</p>
          <p>
            Không lạm dụng Dịch vụ của chúng tôi. Ví dụ, đừng can thiệp vào Dịch vụ của chúng tôi hoặc cố gắng truy cập
            chúng bằng một phương pháp khác ngoài giao diện và hướng dẫn mà chúng tôi cung cấp. Bạn chỉ có thể sử dụng
            Dịch vụ của chúng tôi theo cách được pháp luật cho phép, bao gồm cả các luật và quy định về kiểm soát xuất
            khẩu và nhập khẩu hiện hành. Chúng tôi có thể tạm ngừng hoặc ngừng cung cấp Dịch vụ cho bạn nếu bạn không
            tuân thủ các điều khoản hoặc chính sách của chúng tôi hoặc nếu chúng tôi đang điều tra các hành vi sai trái
            nghi ngờ.
          </p>

          <div id='dữ-liệu-cá-nhân' className='mb-3 active'>
            <h4 className='h6 text-primary'>A. Dữ liệu cá nhân mà chúng tôi thu thập về bạn.</h4>
          </div>

          <p>
            Dữ liệu cá nhân là bất kỳ thông tin nào liên quan đến một cá nhân được xác định hoặc có thể xác định. Dữ liệu
            cá nhân mà bạn cung cấp trực tiếp cho chúng tôi thông qua Trang web của chúng tôi sẽ là rõ ràng từ ngữ cảnh
            mà bạn cung cấp dữ liệu. Cụ thể:
          </p>
          <ul className='text-secondary'>
            <li className='pb-2'>
              Khi bạn đăng ký tài khoản Swiggiweb, chúng tôi thu thập tên đầy đủ, địa chỉ email và thông tin đăng nhập
              tài khoản của bạn.
            </li>
            <li className='pb-2'>
              Khi bạn điền vào biểu mẫu trực tuyến của chúng tôi để liên hệ với nhóm bán hàng, chúng tôi thu thập tên đầy
              đủ, email công việc, quốc gia của bạn và bất cứ điều gì khác bạn cho chúng tôi biết về dự án, nhu cầu và
              lịch trình của bạn.
            </li>
            <li className='pb-2'>
              Khi bạn sử dụng tính năng &quot;Ghi nhớ tôi&quot; của Swiggiweb Checkout, chúng tôi thu thập địa chỉ email, số thẻ
              thanh toán, mã CVC và ngày hết hạn của bạn.
            </li>
          </ul>
          <p>
            Khi bạn phản hồi email hoặc khảo sát của Swiggiweb, chúng tôi thu thập địa chỉ email, tên và bất kỳ thông tin
            nào khác bạn chọn bao gồm trong nội dung email hoặc phản hồi. Nếu bạn liên hệ với chúng tôi qua điện thoại,
            chúng tôi sẽ thu thập số điện thoại bạn sử dụng để gọi cho Swiggiweb. Nếu bạn liên hệ với chúng tôi qua điện
            thoại với tư cách là Người dùng Swiggiweb, chúng tôi có thể thu thập thêm thông tin để xác minh danh tính của
            bạn.
          </p>

          <div id='thông-tin' className='mb-3 active'>
            <h4 className='h6 text-primary'>B. Thông tin mà chúng tôi thu thập tự động trên Trang web của chúng tôi.</h4>
          </div>

          <p>
            Chúng tôi cũng có thể thu thập thông tin về các hoạt động trực tuyến của bạn trên các trang web và thiết bị
            được kết nối qua thời gian và qua các trang web, thiết bị, ứng dụng và các tính năng, dịch vụ trực tuyến
            khác của bên thứ ba. Chúng tôi sử dụng Google Analytics trên Trang web của chúng tôi để giúp chúng tôi phân
            tích việc sử dụng Trang web của bạn và chẩn đoán các vấn đề kỹ thuật.
          </p>
          <p>
            Để biết thêm thông tin về các cookie có thể được phục vụ thông qua Trang web của chúng tôi và cách bạn có
            thể kiểm soát việc sử dụng cookie và phân tích của bên thứ ba, vui lòng xem Chính sách Cookie của chúng tôi.
          </p>
        </div>
        <div id='quyền-riêng-tư' className='mb-4'>
          <div className='mb-3'>
            <h3 className='h5 text-primary'>2. Quyền riêng tư và bảo vệ bản quyền</h3>
          </div>

          <p>
            Chính sách quyền riêng tư của Swiggiweb giải thích cách chúng tôi xử lý dữ liệu cá nhân của bạn và bảo vệ
            quyền riêng tư của bạn khi bạn sử dụng Dịch vụ của chúng tôi. Bằng cách sử dụng Dịch vụ của chúng tôi, bạn
            đồng ý rằng Swiggiweb - Mẫu Website Đặt Món Ăn Trực Tuyến có thể sử dụng dữ liệu đó theo chính sách quyền
            riêng tư của chúng tôi.
          </p>
          <p>
            Chúng tôi phản hồi các thông báo về cáo buộc vi phạm bản quyền và chấm dứt tài khoản của những người vi phạm
            lặp lại theo quy trình được nêu trong Đạo luật Bản quyền kỹ thuật số Thiên niên kỷ Mới của Hoa Kỳ.
          </p>
          <p>
            Chúng tôi cung cấp thông tin để giúp những người nắm giữ bản quyền quản lý tài sản trí tuệ trực tuyến của họ.
            Nếu bạn cho rằng ai đó đang vi phạm bản quyền của bạn và muốn thông báo cho chúng tôi, bạn có thể tìm thông
            tin về việc gửi thông báo và chính sách của Swiggiweb về việc phản hồi thông báo trong
            <Link to='help'> Trung tâm trợ giúp</Link> của chúng tôi.
          </p>
        </div>
        <div id='nội-dung-của-bạn' className='active'>
          <div className='mb-3'>
            <h3 className='h5 text-primary'>3. Nội dung của bạn trong các dịch vụ của chúng tôi</h3>
          </div>

          <p>
            Một số Dịch vụ của chúng tôi cho phép bạn tải lên, gửi, lưu trữ, gửi hoặc nhận nội dung. Bạn vẫn giữ quyền
            sở hữu trí tuệ đối với bất kỳ nội dung nào bạn có. Tóm lại, những gì thuộc về bạn vẫn thuộc về bạn.
          </p>
          <p>
            Khi bạn tải lên, gửi, lưu trữ, gửi hoặc nhận nội dung vào hoặc thông qua Dịch vụ của chúng tôi, bạn cấp cho
            Swiggiweb (và những người chúng tôi làm việc với) giấy phép toàn cầu để sử dụng, lưu trữ, sao chép, sửa
            đổi, tạo các tác phẩm phái sinh (như những cái kết quả từ các bản dịch, điều chỉnh hoặc các thay đổi khác
            mà chúng tôi thực hiện để nội dung của bạn hoạt động tốt hơn với Dịch vụ của chúng tôi), truyền thông, công
            bố, trình diễn công khai, hiển thị công khai và phân phối nội dung đó.
          </p>
        </div>
      </div>
    </>
  )
}

export default Term
