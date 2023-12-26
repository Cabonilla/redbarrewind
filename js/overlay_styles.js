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
font-size: 100px;
font-weight: 400;
color: ${redMeta};
margin-bottom: -35px;
`

let image_style = `
width: 160px;
height: auto;
box-sizing: border-box;
pointer-events: none;
position: absolute;
left: 0;
top: -25px;
`;

let buttons_style = `
display: flex;
justify-content: space-between;
align-items: center;
margin-top: 2px;
width: 250px;
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
color: #dedcdc;;
font-size: 55px;
outline: none;
font-family: DotGothic, sans-serif;
font-weight: 400;
z-index: 40 !important;
position: relative;
text-align: center;
align-content: center;
width: 250px; 
letter-spacing: 3px;
caret-color: rgba(0, 0, 0, 0);
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
width: 140px;
height: 36px;
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
width: 36px;
height: 36px;
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
height: 36px;
width: 36px;
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
