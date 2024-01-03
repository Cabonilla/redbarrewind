let redMeta = "#FF2424"

let overlay_style = `
position: fixed;
inset: 0 !important;
border: none;
padding: 0;
top: 0 !important;
margin: 0 !important;
opacity: 0;
outline: none;
background: linear-gradient(rgba(0,0,0,.75), rgba(0,0,0,0));
transition: opacity .25s cubic-bezier(.25, 0, .3, 1) !important;
`;

let small_style = `
margin-top: .5vw; 
font-family: HelNeuMed; 
font-size: .40vw; 
color: #FF2424;
`

let rr_container = `
display: flex;
justify-content: center;
align-items: center;
flex-direction: column;
`

let redbar_title = `
position: relative;
`

let rewind_text = `
font-family: Grischel;
font-size: 5vw;
font-weight: 400;
color: ${redMeta};
margin-bottom: -1.85vw;
`

let image_style = `
width: 7.75vw;
height: auto;
box-sizing: border-box;
pointer-events: none;
position: absolute;
left: 0;
top: -1.25vw;
`;

let buttons_style = `
display: flex;
justify-content: space-between;
align-items: center;
width: 12vw;
`

let link_logo_style = `
width: 12px;
height: auto;
filter: invert(73%) sepia(28%) saturate(8%) hue-rotate(314deg) brightness(106%) contrast(116%);
`;

let time_logo_style = `
width: 12px;
height: auto;
filter: invert(73%) sepia(28%) saturate(8%) hue-rotate(314deg) brightness(106%) contrast(116%);
`;

let input_style = `
border: 0px solid;
height: auto;
background-color: transparent;
color: #dedcdc;
font-size: 2.75vw;
outline: none;
font-family: DotGothic, sans-serif;
font-weight: 400;
z-index: 40 !important;
position: relative;
text-align: center;
align-content: center;
letter-spacing: .15vw;
caret-color: rgba(0, 0, 0, 0);
margin: 0;
padding: 0;
`;

let form_style = `
display: flex;
align-items: center;
justify-content: center;
position: relative;
flex-direction: column;
`;

let button_style = `
font-family: Dots, sans-serif;
width: 6vw;
height: 2vw;
line-height: 20px;
padding: 0;
border: none;
background: ${redMeta};
cursor: pointer;
border-radius: 20px;
font-size: 12px;
color: white;
transition: box-shadow .15s ease-in-out;
display: flex;
justify-content: center;
align-items: center;
`;

let link_button_style = `
width: 2vw;
height: 2vw;
line-height: 20px;
padding: 0;
border: none;
background: ${redMeta};
cursor: pointer;
border-radius: 100%;
display: flex;
justify-content: center;
align-items: center;
transition: box-shadow .15s ease-in-out;
`;

let time_button_style = `
height: 2vw;
width: 2vw;
line-height: 20px;
padding: 0;
border: none;
background: ${redMeta};
cursor: pointer;
border-radius: 100%;
display: flex;
justify-content: center;
align-items: center;
transition: box-shadow .15s ease-in-out;
`;
