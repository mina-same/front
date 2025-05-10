import { Button } from "../../../../components/ui/button";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

const BookServiceButton = ({ serviceId }) => {
  const router = useRouter();

  const handleBookService = () => {
    router.push(`/reservation/${serviceId}`);
  };

  return (
    <Button
      onClick={handleBookService}
      className="w-full bg-gold hover:bg-gold/90 text-white"
    >
      <CalendarPlus className="mr-2 h-4 w-4" />
      Book Service
    </Button>
  );
};

export default BookServiceButton;
