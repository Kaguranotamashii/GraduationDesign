import React from 'react';
import styled from 'styled-components';

// 使用 styled-components 定义导航栏样式
const NavContainer = styled.nav`
    background-color: #333;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

const Logo = styled.div`
    font-size: 1.5rem;
    color: white;
    font-weight: bold;
`;

const NavLinks = styled.ul`
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
`;

const NavLink = styled.li`
    margin-left: 2rem;

    a {
        text-decoration: none;
        color: white;
        transition: color 0.3s ease;

        &:hover {
            color: #ffcc00;
        }
    }
`;

const Navbar = () => {
    return (
        <NavContainer>
            <Logo>MyApp</Logo>
            <NavLinks>
                <NavLink><a href="#home">Home</a></NavLink>
                <NavLink><a href="#about">About</a></NavLink>
                <NavLink><a href="#services">Services</a></NavLink>
                <NavLink><a href="#contact">Contact</a></NavLink>
            </NavLinks>
        </NavContainer>
    );
};

export default Navbar;
