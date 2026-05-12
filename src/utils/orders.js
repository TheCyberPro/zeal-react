/* src/utils/orders.js */
export function loadOrders() {
  const raw = localStorage.getItem("marell_orders");
  return raw ? JSON.parse(raw) : [];
}

export function saveOrders(arr) {
  localStorage.setItem("marell_orders", JSON.stringify(arr));
}

export function createOrder(order) {
  const arr = loadOrders();
  arr.unshift(order);
  saveOrders(arr);
  notifyTawk(order);
  return order;
}

export function updateOrder(id, patch) {
  const arr = loadOrders().map(o => (o.id === id ? { ...o, ...patch } : o));
  saveOrders(arr);
  return arr.find(o => o.id === id);
}

function notifyTawk(order) {
  try {
    if (typeof window !== "undefined" && window.Tawk_API) {
      window.Tawk_API.setAttributes(
        {
          lastOrderId: order.id,
          lastOrderType: order.type,
          lastOrderAmount: String(order.amount),
          lastOrderPhone: order.phone || ""
        },
        function () {
          if (window.Tawk_API.popup) window.Tawk_API.popup();
        }
      );
      if (window.Tawk_API.addEvent) {
        window.Tawk_API.addEvent("order_created", { id: order.id, type: order.type, amount: order.amount });
      }
    }
  } catch (err) {
    console.warn("Tawk notify failed", err);
  }
}
