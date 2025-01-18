// toastUtils.js
import { toast } from 'react-toastify';
import { FaCheckCircle, FaSmileBeam } from 'react-icons/fa';

const showSuccessToast = () => {
  toast.success(
    <div className="flex items-center space-x-4">
      <FaCheckCircle className="text-4xl text-green-500" />
      <div>
        <h3 className="text-lg font-semibold">Success!</h3>
        <p className="text-sm">Your service has been submitted successfully. 🎉</p>
      </div>
    </div>,
    {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
      className: "border-l-4 border-green-500 bg-white shadow-lg",
      icon: <FaSmileBeam className="text-yellow-500 text-2xl" />,
    }
  );
};

export default showSuccessToast; // Default export