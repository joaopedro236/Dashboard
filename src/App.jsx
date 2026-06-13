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
      try{
      const response = await fetch(`${ApiUrl}/metrics`);
      const data = await response.json();
      
      
      setData(data);
      }catch(error) {
        console.error(error)
      }

    };

    Fetch();

    const interval = setInterval(Fetch, 5000);

    return () => clearInterval(interval);
  }, []);
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    const handleLoad = () => {
      setLoading(false)
    }
    if (document.readyState === 'complete') {
      setLoading(false)
    } else {
      window.addEventListener('load', handleLoad)
    }
    return () => {
      window.removeEventListener("load", handleLoad);
    };
  }, [])
  const [ui, setUi] = useState({

    hideNavbar: false,
    isOpen: false
  });
  return (
    <>
      <section className={`loadSection ${loading ? 'Active' : ''}`}>
        <p>loading</p>
      </section>
      <Navbar hidden={ui.hideNavbar} />
      <SideBar hidden={ui.hideSideBar} />
      <main>
        <CardsMain ui={ui} setUi={setUi} Data={data} />
        <Tables />
        <Config ui={ui} setUi={setUi} isOpen={ui.isOpen} />
        <Infrastructure Data={data} />
      </main>
    </>
  )
}

