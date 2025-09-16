# app.py
from flask import Flask, request, jsonify
import torch
import torch.nn as nn
import os

# Khởi tạo ứng dụng Flask
app = Flask(__name__)

# Đường dẫn đến file mô hình
MODEL_PATH = os.path.join(os.getcwd(), 'best.pt')

# Biến toàn cục để chứa mô hình
model = None

# Hàm tải mô hình từ file .pt
def load_model():
    global model
    try:
        # Tải mô hình từ file
        model = torch.load(MODEL_PATH)
        # Đảm bảo mô hình ở chế độ đánh giá
        model.eval()
        print(f"Mô hình đã được tải thành công từ: {MODEL_PATH}")
    except Exception as e:
        print(f"Lỗi khi tải mô hình: {e}")
        model = None

# Định nghĩa endpoint API để nhận yêu cầu dự đoán
@app.route('/predict', methods=['POST'])
def predict():
    # Kiểm tra xem mô hình đã được tải chưa
    if model is None:
        return jsonify({"error": "Mô hình chưa được tải hoặc bị lỗi. Vui lòng kiểm tra lại đường dẫn."}), 500
    
    # Kiểm tra xem yêu cầu có phải là JSON và có dữ liệu không
    if not request.is_json:
        return jsonify({"error": "Dữ liệu đầu vào phải ở định dạng JSON."}), 400
    
    data = request.get_json()
    if 'input_data' not in data:
        return jsonify({"error": "Thiếu trường 'input_data' trong dữ liệu."}), 400

    input_data = data['input_data']

    try:
        # --- BƯỚC XỬ LÝ DỮ LIỆU ĐẦU VÀO CỦA BẠN ---
        # Chuyển dữ liệu đầu vào thành tensor.
        # Lưu ý: Bạn cần thay thế phần này bằng logic xử lý dữ liệu đầu vào cụ thể của mô hình bạn.
        # Ví dụ: nếu mô hình của bạn là YOLOv8 thì cần xử lý hình ảnh đầu vào
        # Ví dụ: input_tensor = preprocess_image(input_data)
        
        # Giả định dữ liệu đầu vào là một list số
        input_tensor = torch.tensor(input_data)
        
        # Chạy dự đoán
        with torch.no_grad():
            prediction = model(input_tensor)
        
        # Chuyển kết quả dự đoán sang list Python để trả về JSON
        result = prediction.tolist()

        return jsonify({"prediction": result})
        
    except Exception as e:
        print(f"Lỗi khi xử lý dữ liệu hoặc dự đoán: {e}")
        return jsonify({"error": f"Lỗi xử lý dữ liệu: {str(e)}"}), 500

# Khởi chạy ứng dụng
if __name__ == '__main__':
    print("Bắt đầu tải mô hình...")
    load_model()
    # Chạy ứng dụng web trên cổng 5000 và lắng nghe tất cả các địa chỉ IP
    app.run(host='0.0.0.0', port=5000)