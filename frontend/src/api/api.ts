const sendData = async (url: string, data: any) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      console.error(`Failed to send data: ${res.statusText}`);
    }
  } catch (err) {
    console.error("Error sending data:", err);
  }
};
const getData = async (url: string) => {
  const response = await fetch(url);
  return response.json();
};
export { sendData, getData };
