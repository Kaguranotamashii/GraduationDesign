
import HeritageDetail from "../../components/heritage/HeritageDetail";
import Navbar from "../../components/home/Navbar";
import Header from "../../components/home/Header";
import ContentSection from "../../components/home/ContentSection";
import Footer from "../../components/home/Footer";

const Home = () => {
  return (
      <div className="min-h-screen">
        {/*<HeritageDetail/>*/}
        {/*  <Navbar/>*/}
          <Header/>
          <ContentSection/>
          <Footer/>

      </div>
  );
};

export default Home;