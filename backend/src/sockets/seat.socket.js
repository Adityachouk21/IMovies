/**
 * Seat Socket Manager
 * Handles real-time seat locks, selection events, and broadcast updates
 */
export const initSeatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room for a specific show
    socket.on('join_show', ({ showId }) => {
      if (showId) {
        socket.join(`show_${showId}`);
        console.log(`[Socket.io] Socket ${socket.id} joined show room: show_${showId}`);
      }
    });

    // Leave room
    socket.on('leave_show', ({ showId }) => {
      if (showId) {
        socket.leave(`show_${showId}`);
        console.log(`[Socket.io] Socket ${socket.id} left show room: show_${showId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });
};
