
import React, { useState } from 'react';
import styled from 'styled-components';

// 使用 styled-components 定义导航栏样式
const NavContainer = styled.nav`    background-color: #333;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    @media (max-width: 768px) {
        padding: 1rem;
    }`;

const Logo = styled.div`    font-size: 1.5rem;
    color: white;
    font-weight: bold;`;

const NavLinks = styled.ul.attrs(props => ({
    isOpen: undefined, // 确保 isOpen 不传递给 DOM
}))`    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    @media (max-width: 768px) {
        display: ${props => (props.isOpen ? 'flex' : 'none')};
        flex-direction: column;
        position: absolute;
        top: 60px;
        right: 0;
        background-color: #333;
        width: 100%;
        padding: 1rem 0;
    }`;

const NavLink = styled.li`    margin-left: 2rem;
    @media (max-width: 768px) {
        margin-left: 0;
        margin-bottom: 1rem;
        text-align: center;
    }

    a {
        text-decoration: none;
        color: white;
        transition: color 0.3s ease;

        &:hover {
            color: #ffcc00;
        }
    }`;

const Hamburger = styled.div`    display: none;
    cursor: pointer;
    @media (max-width: 768px) {
        display: block;
        font-size: 2rem;
        color: white;
    }`;

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <NavContainer>
            <Logo>MyApp</Logo>
            <Hamburger onClick={toggleMenu}>
                {isOpen ? '×' : '☰'}
            </Hamburger>
            <NavLinks isOpen={isOpen}>
                <NavLink><a href="#home">Home</a></NavLink>
                <NavLink><a href="#about">About</a></NavLink>
                <NavLink><a href="#services">Services</a></NavLink>
                <NavLink><a href="#contact">Contact</a></NavLink>
            </NavLinks>
        </NavContainer>
    );
};

export default Navbar;