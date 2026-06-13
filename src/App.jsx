import { useState, useEffect } from 'react'
import './StylesGlobals/Reset.css'
import './StylesGlobals/Assets.css'
import './StylesGlobals/Root.css'
import Navbar from './Components/NavbarComponent/Navbar'
import SideBar from './Components/SideBarComponent/SideBar'
import CardsMain from './Components/CardsMainComponent/CardsMain'
import Tables from './Components/Tables/Tables'
import Config from './Components/ConfigComponent/Config'
import Infrastructure from './Components/InfrastructureComponent/Infrastructure'
import './StylesGlobals/Media.css'
export default function App() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])
  const [data, setData] = useState(null);
  const ApiUrl = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const Fetch = async () => {
      const response = await fetch(`${ApiUrl}/metrics`);
      const data = await response.json();
      setData(data);
    };

    Fetch();

    const interval = setInterval(Fetch, 4000);

    return () => clearInterval(interval);
  }, []);
  const [ui, setUi] = useState({

    hideNavbar: false,
    hideSideBar: false,
    isOpen: false
  });
  return (
    <>
      <Navbar hidden={ui.hideNavbar} />
      <SideBar hidden={ui.hideSideBar} />
      <main>
        <CardsMain ui={ui} setUi={setUi} Data={data} />
        <Tables />
        <Config ui={ui} setUi={setUi} isOpen={ui.isOpen}/>
        <Infrastructure  Data={data} />
      </main>
    </>
  )
}

