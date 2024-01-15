const getters = {
  sidebar: (state) => state.app.sidebar,
  device: (state) => state.app.device,
  token: (state) => state.user.token,
  token_expire: (state) => state.user.token_expire,
  avatar: (state) => state.user.avatar,
  name: (state) => state.user.name,
  socket: (state) => state.k8s.socket,
  message: (state) => state.k8s.socket.message,
  namespace: (state) => state.k8s.socket.namespace,
};
export default getters;
