import { client } from "../lib/sanity";
import { toast } from "sonner";

// Simulate a payment process - in a real app this would connect to a payment gateway
const simulatePaymentProcess = async (price) => {
  // Simulate payment processing delay
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Simulate success (90% of the time) or failure
  return Math.random() < 0.9;
};

// Create a book order in Sanity
export const createBookOrder = async ({ itemId, price, userId = "guest-user" }) => {
  try {
    console.log(`Creating book order for book: ${itemId} at price: ${price}`);

    // Simulate payment process
    const paymentSuccessful = await simulatePaymentProcess(price);

    if (!paymentSuccessful) {
      toast.error("Payment failed. Please try again.");
      return { success: false, error: "Payment processing failed" };
    }

    // Create a new order document in Sanity
    const order = {
      _type: "orderBook",
      book: {
        _type: "reference",
        _ref: itemId,
      },
      user: {
        _type: "reference",
        _ref: userId,
      },
      orderDate: new Date().toISOString(),
      status: "completed",
      price: price,
      paymentStatus: "paid",
      transactionId: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    const result = await client.create(order);

    if (result && result._id) {
      toast.success("Book purchased successfully! You can now access its materials.");
      return { success: true, orderId: result._id };
    } else {
      toast.error("Failed to complete order. Please try again.");
      return { success: false, error: "Failed to create order" };
    }
  } catch (error) {
    console.error("Error creating book order:", error);
    toast.error("An error occurred. Please try again later.");
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};

// Create a course order in Sanity
export const createCourseOrder = async ({ itemId, price, userId = "guest-user" }) => {
  try {
    console.log(`Creating course order for course: ${itemId} at price: ${price}`);

    // Simulate payment process
    const paymentSuccessful = await simulatePaymentProcess(price);

    if (!paymentSuccessful) {
      toast.error("Payment failed. Please try again.");
      return { success: false, error: "Payment processing failed" };
    }

    // Create a new order document in Sanity
    const order = {
      _type: "orderCourse",
      course: {
        _type: "reference",
        _ref: itemId,
      },
      user: {
        _type: "reference",
        _ref: userId,
      },
      orderDate: new Date().toISOString(),
      status: "completed",
      price: price,
      paymentStatus: "paid",
      transactionId: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    const result = await client.create(order);

    if (result && result._id) {
      toast.success("Course purchased successfully! You can now access its materials.");
      return { success: true, orderId: result._id };
    } else {
      toast.error("Failed to complete order. Please try again.");
      return { success: false, error: "Failed to create order" };
    }
  } catch (error) {
    console.error("Error creating course order:", error);
    toast.error("An error occurred. Please try again later.");
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
};