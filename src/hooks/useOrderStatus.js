// import { useQuery } from "@tanstack/react-query";
// import { client } from "../lib/sanity";

// export const useOrderStatus = (itemId, itemType) => {
//   // Validate itemType
//   if (!itemType || !["book", "course"].includes(itemType)) {
//     throw new Error(`Invalid or missing itemType: ${itemType}`);
//   }

//   const queryType = itemType === "book" ? "orderBook" : "orderCourse";

//   return useQuery({
//     queryKey: [`${itemType}Order`, itemId],
//     queryFn: async () => {
//       const query = `*[_type == "${queryType}" && ${itemType}._ref == $itemId][0]{
//         paymentStatus,
//         status
//       }`;
//       const result = await client.fetch(query, { itemId });
//       if (!result) {
//         // Fallback for when no order is found
//         return { paymentStatus: "not-found", status: "not-found" };
//       }
//       return result;
//     },
//     // Only run the query if itemId and itemType are defined
//     enabled: !!itemId && !!itemType,
//   });
// };