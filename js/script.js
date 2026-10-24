const bookingForm = document.querySelector("#booking-form");
const formMessage = document.querySelector("#form-message");
const appointmentDate = bookingForm?.querySelector("[name=date]");
const timeSelect = bookingForm?.querySelector("[name=time]");

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (hour) => {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

const getTimeSlots = (dateValue) => {
  if (!dateValue) return [];

  const selectedDate = new Date(`${dateValue}T00:00:00`);
  const day = selectedDate.getDay();
  if (day === 0) return [];

  const firstHour = day === 6 ? 10 : 9;
  const lastHour = day === 6 ? 17 : 19;
  const now = new Date();
  const isToday = dateValue === formatDate(now);

  return Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index)
    .filter((hour) => !isToday || hour > now.getHours())
    .map(formatTime);
};

const updateTimeSlots = () => {
  if (!timeSelect) return;

  const slots = getTimeSlots(appointmentDate.value);
  timeSelect.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.disabled = true;
  placeholder.selected = true;
  placeholder.textContent = appointmentDate.value
    ? slots.length ? "Select a time" : "No times available"
    : "Select a time";
  timeSelect.appendChild(placeholder);

  slots.forEach((slot) => {
    const option = document.createElement("option");
    option.value = slot;
    option.textContent = slot;
    timeSelect.appendChild(option);
  });
};

const setMessage = (message, isError = false) => {
  formMessage.textContent = message;
  formMessage.classList.toggle("error", isError);
  formMessage.hidden = !message;
};

if (appointmentDate) {
  appointmentDate.min = formatDate(new Date());
  appointmentDate.addEventListener("change", updateTimeSlots);
  updateTimeSlots();
}

bookingForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  setMessage("");

  const formData = new FormData(bookingForm);
  const phoneDigits = formData.get("phone").replace(/\D/g, "");

  if (!bookingForm.checkValidity() || phoneDigits.length < 7) {
    setMessage("Please complete every field with valid information.", true);
    bookingForm.reportValidity();
    return;
  }

  const date = formData.get("date");
  const time = formData.get("time");
  const availableSlots = getTimeSlots(date);

  if (!availableSlots.includes(time)) {
    setMessage("That appointment time is no longer available. Please choose another time.", true);
    updateTimeSlots();
    return;
  }

  setMessage("Thank you — your appointment request has been received.");
  bookingForm.reset();
  updateTimeSlots();
});
