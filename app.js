document.addEventListener('DOMContentLoaded', function() {
    // Obtener elementos del DOM
    const daysCountElement = document.getElementById('daysCount');
    const currentDateElement = document.getElementById('currentDate');
    const currentTimeElement = document.getElementById('currentTime');
    const targetTimeElement = document.getElementById('targetTime');
    const targetYearElement = document.getElementById('targetYear');
    const progressBarElement = document.getElementById('progressBar');
    const holidaysListElement = document.getElementById('holidaysList');
    
    // Fecha objetivo (31 de diciembre del año actual)
    const currentYear = new Date().getFullYear();
    const targetDate = new Date(currentYear, 11, 31); // Diciembre es el mes 11
    targetTimeElement.textContent = '15:00:00';
    
    // Mostrar año objetivo
    targetYearElement.textContent = currentYear;
    
    // Días festivos oficiales en México (fechas fijas)
    const fixedHolidays = [
        { name: "Año Nuevo", date: new Date(currentYear, 0, 1) },
        { name: "Día de la Constitución", date: new Date(currentYear, 1, 5) }, // Primer lunes de febrero
        { name: "Natalicio de Benito Juárez", date: new Date(currentYear, 2, 21) }, // Tercer lunes de marzo
        { name: "Día del Trabajo", date: new Date(currentYear, 4, 1) },
        { name: "Día de la Independencia", date: new Date(currentYear, 8, 16) }, // Se celebra el 16
        { name: "Revolución Mexicana", date: new Date(currentYear, 10, 20) }, // Tercer lunes de noviembre
        { name: "Navidad", date: new Date(currentYear, 11, 25) }
    ];
    
    // Ajustar días festivos que se mueven al lunes más cercano (Ley Federal del Trabajo)
    adjustHolidaysToMonday(fixedHolidays);
    
    // Función para actualizar la hora y fecha actual
    function updateDateTime() {
        const today = new Date();
        currentDateElement.textContent = formatDate(today);
        currentTimeElement.textContent = today.toLocaleTimeString('es-MX');
        
        // Recalcular días laborables cada vez que se actualiza la hora
        const workingDays = calculateWorkingDays(today, targetDate, fixedHolidays);
        daysCountElement.textContent = workingDays;
        
        // Recalcular y mostrar progreso del año
        const yearStart = new Date(currentYear, 0, 1);
        const totalYearDays = Math.ceil((targetDate - yearStart) / (1000 * 60 * 60 * 24)) + 1;
        const daysPassed = Math.ceil((today - yearStart) / (1000 * 60 * 60 * 24));
        const progressPercentage = (daysPassed / totalYearDays) * 100;
        progressBarElement.style.width = `${progressPercentage}%`;
    }
    
    // Llamar a la función inmediatamente y luego cada segundo
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Mostrar días festivos restantes (solo una vez, no necesita actualización)
    displayRemainingHolidays(fixedHolidays, new Date());
    
    // Función para calcular días laborables
    function calculateWorkingDays(startDate, endDate, holidays) {
        let count = 0;
        const current = new Date(startDate);
        
        // Asegurarnos de no contar el día actual si ya pasó la hora laboral
        if (current.getHours() >= 18) {
            current.setDate(current.getDate() + 1);
        }
        
        current.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(0, 0, 0, 0);
        
        while (current <= end) {
            const dayOfWeek = current.getDay();
            // Si es día laborable (lunes a viernes)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                // Verificar si no es día festivo
                let isHoliday = false;
                for (const holiday of holidays) {
                    if (isSameDate(current, holiday.date)) {
                        isHoliday = true;
                        break;
                    }
                }
                
                if (!isHoliday) {
                    count++;
                }
            }
            
            current.setDate(current.getDate() + 1);
        }
        
        return count;
    }
    
    // Función para ajustar SOLO los días festivos que se recorren al lunes
    function adjustHolidaysToMonday(holidays) {
        holidays.forEach(holiday => {
            // Solo ajustamos los días que deben moverse al lunes
            const shouldMoveToMonday = 
                holiday.name === "Día de la Constitución" ||
                holiday.name === "Natalicio de Benito Juárez" || 
                holiday.name === "Revolución Mexicana";
            
            if (shouldMoveToMonday) {
                const dayOfWeek = holiday.date.getDay();
                // Si es domingo, movemos al lunes siguiente
                if (dayOfWeek === 0) {
                    holiday.date.setDate(holiday.date.getDate() + 1);
                }
                // Si es de martes a sábado, movemos al lunes anterior
                else if (dayOfWeek > 1) {
                    holiday.date.setDate(holiday.date.getDate() - (dayOfWeek - 1));
                }
                // Si ya es lunes (1), no hacemos nada
            }
            // Los días festivos fijos (Año Nuevo, Día del Trabajo, Independencia, Navidad)
            // se mantienen en su fecha exacta
        });
    }
    
    // Función para mostrar días festivos restantes
    function displayRemainingHolidays(holidays, today) {
        const remainingHolidays = holidays.filter(holiday => 
            holiday.date >= today && holiday.date <= targetDate
        );
        
        if (remainingHolidays.length === 0) {
            holidaysListElement.innerHTML = '<p>No hay más días festivos este año.</p>';
            return;
        }
        
        // Ordenar por fecha
        remainingHolidays.sort((a, b) => a.date - b.date);
        
        // Crear elementos para cada día festivo
        remainingHolidays.forEach(holiday => {
            const holidayElement = document.createElement('div');
            holidayElement.className = 'holiday-item';
            
            const holidayDateElement = document.createElement('div');
            holidayDateElement.className = 'holiday-date';
            holidayDateElement.innerHTML = `
                <div class="holiday-day">${holiday.date.getDate()}</div>
                <div class="holiday-month">${getMonthName(holiday.date.getMonth())}</div>
            `;
            
            const holidayNameElement = document.createElement('div');
            holidayNameElement.className = 'holiday-name';
            holidayNameElement.textContent = holiday.name;
            
            holidayElement.appendChild(holidayDateElement);
            holidayElement.appendChild(holidayNameElement);
            
            holidaysListElement.appendChild(holidayElement);
        });
    }
    
    // Función auxiliar para formatear fecha
    function formatDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('es-MX', options);
    }
    
    // Función auxiliar para obtener nombre del mes
    function getMonthName(month) {
        const months = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];
        return months[month];
    }
    
    // Función auxiliar para comparar si dos fechas son iguales (ignorando hora)
    function isSameDate(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate();
    }
});
