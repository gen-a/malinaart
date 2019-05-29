/**
 * Swipe event detect by incoming pointer events
 * @param swipeDistance
 * @param swipeTime
 * @constructor
 */
const Swipe = function Swipe(swipeDistance = 30, swipeTime = 300) {
  this.timer = 0;
  this.swipeDistance = swipeDistance;
  this.swipeTime = swipeTime;
  this.data = {};
  this.startPoint = [];
  this.endPoint = [];
};
Swipe.prototype = {
  /**
   * On detect swipe method has to be replace with custom one
   * @param e
   */
  onSwipe(e) {
    console.group('Swipe message');
    console.error('onSwipe callback not defined...');
    console.dir(e);
    console.groupEnd();
  },
  /**
   * Store initial, data
   * Collect x,y data of touch motion
   * x {number} - ClientX touch coordinate
   * y {number} - ClientY touch coordinate
   */
  start(x, y) {
    this.startPoint = [x, y];
    this.endPoint = [x, y];
    this.timer = new Date().getTime();
  },
  /**
   * Collect x,y data of touch motion
   * x {number} - ClientX touch coordinate
   * y {number} - ClientY touch coordinate
   */
  move(x, y) {
    this.endPoint = [x, y];
  },
  /**
   * End touch detection and analise if swipe is met
   */
  end() {
    /**
     * Convert degrees to oClock.
     * @param degrees {number}
     * @returns {number}
     */
    const convertDegreesToHours = (degrees) => {
      const degreesWithOffset = degrees + 90;
      const hours = Math.round(
        (
          degreesWithOffset < 0
            ? 360 + degreesWithOffset
            : degreesWithOffset
        ) / 30
      );
      return hours === 0 ? 12 : hours;
    };
    /**
     * Detect swipe direction against deltaX and deltaY
     * @param deltaX {number} - horizontal delta
     * @param deltaY {number} - vertical delta
     * @returns {string}
     */
    const detectSwipeDirection = (deltaX, deltaY) => {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        return deltaX > 0 ? 'right' : 'left';
      }
      return deltaY > 0 ? 'down' : 'up';
    };

    const { startPoint, endPoint, timer, swipeDistance, swipeTime } = this;
    const time = new Date().getTime() - timer;
    /** Collect deltas data. */
    const delta = {};
    delta.x = endPoint[0] - startPoint[0];
    delta.y = endPoint[1] - startPoint[1];
    /** Calculate distance. */
    const distance = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    /** Collect angle data. */
    const angle = {};
    angle.radians = Math.atan2(delta.y, delta.x);
    angle.degrees = angle.radians * (180 / Math.PI);
    /** Angle to hours conversion. */
    const oClock = convertDegreesToHours(angle.degrees);
    /** Calculate speed. */
    const speed = distance / time;
    /** Collect result. */
    if (distance > swipeDistance && swipeTime > time) {
      const direction = detectSwipeDirection(delta.x, delta.y);
      this.onSwipe({
        oClock,
        direction,
        delta,
        distance,
        time,
        speed,
        angle
      });
      window.getSelection().removeAllRanges();
    }
  }
};

export default Swipe;