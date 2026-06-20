let Expo;

const sendNotification = async (pushToken, title, body) => {
  try {
    if (!pushToken) return;

    // 🔥 dynamic import
    if (!Expo) {
      const expoModule = await import("expo-server-sdk");
      Expo = expoModule.Expo;
    }

    const expo = new Expo();

    const message = {
      to: pushToken,
      sound: "default",
      title,
      body,
    };

    await expo.sendPushNotificationsAsync([message]);

  } catch (err) {
    console.log("Notification Error:", err);
  }
};

module.exports = sendNotification;