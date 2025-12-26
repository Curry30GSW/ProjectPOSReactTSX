export const formatFechaHora = (fechaISO: string) => {
    const date = new Date(fechaISO);

    const meses = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    const dia = String(date.getDate()).padStart(2, "0");
    const mes = meses[date.getMonth()];
    const anio = date.getFullYear();

    const fecha = `${dia}/${mes}/${anio}`;

    let horas = date.getHours();
    const minutos = String(date.getMinutes()).padStart(2, "0");

    const periodo = horas >= 12 ? "Pm" : "Am";

    horas = horas % 12;
    horas = horas === 0 ? 12 : horas;

    const hora = `${horas}:${minutos} ${periodo}`;

    return { fecha, hora };
};
