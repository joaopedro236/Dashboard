import './StylesGlobals/Reset.css'
import './StylesGlobals/Assets.css'
import './StylesGlobals/Root.css'
import Navbar from './Components/NavbarComponent/Navbar'
import { useState } from 'react'
import SideBar from './Components/SideBarComponent/SideBar'
import CardsMain from './Components/CardsMainComponent/CardsMain'
import Tables from './Components/Tables/Tables'
import Config from './Components/ConfigComponent/Config'
import './StylesGlobals/Media.css'
export default function App() {
  const [ui, setUi] = useState({
    hideNavbar: false,
    hideSideBar: false,
    openConfig: false
  });
  return (
    <>
      <Navbar hidden={ui.hideNavbar}/>
      <SideBar  hidden={ui.hideSideBar}/>
      <main>
        <Tables />
        <CardsMain   ui={ui} setUi={setUi} />
        <Config  ui={ui} setUi={setUi} hidden={ui.openConfig}/>
      </main>
    </>
  )
}

