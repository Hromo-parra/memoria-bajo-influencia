window.DEMO_CONFIG = {
  team: 'Equipo 5 · Memoria', title: 'Memoria bajo influencia', duration: '2–3 minutos',
  intro: 'Mira cómo se presenta un evento y cómo una información posterior puede influir en el recuerdo. La demo es abreviada.',
  outro: 'El estudio real contrabalancea listas y formas de prueba, registra respuestas inmediatas y diferidas y requiere siete días entre evaluaciones.',
  steps: [
    {type:'video', title:'Evento audiovisual', text:'Este es el estímulo del estudio. Para la exposición puedes ver un fragmento y continuar.', src:'assets/evento-cafeteria.mp4'},
    {type:'info', title:'Información postevento', text:'Después del video se presentan preguntas y una lista de detalles. Algunas versiones contienen información que puede desviar el recuerdo.', points:['La versión depende de un código anónimo.','En la prueba real hay ejercicios distractores antes de responder.','La demo no asigna una condición experimental.']},
    {type:'choice', title:'Una pregunta de recuerdo', text:'Elige una respuesta para ver cómo se captura un reactivo.', question:'¿Qué recordarías del evento?', options:['Un detalle que vi en el video','Un detalle que leí después','No lo recuerdo'], feedback:'La aplicación real registra respuesta, confianza, fuente atribuida y latencia. La exactitud depende del reactivo y la versión asignada.'},
    {type:'scale', title:'Confianza en el recuerdo', text:'Además de la respuesta se solicita cuánta seguridad tiene la persona.', prompt:'¿Qué confianza tienes en la respuesta anterior?', min:0,max:100,value:50,left:'0 · Ninguna',right:'100 · Total'}
  ]
};
