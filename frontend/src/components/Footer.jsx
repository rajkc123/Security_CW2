import React from "react";

const Footer = () => {
    return (
        <footer style={footerStyle}>
            <div style={containerStyle}>
                <div style={sectionStyle}>
                    <h5>Important Links</h5>
                    <div>
                        <a href="/gallery" style={linkStyle}>
                            Gallery
                        </a>
                        <a href="/about-us" style={linkStyle}>
                            About Us
                        </a>
                    </div>
                </div>
                <div style={sectionStyle}>
                    <h5>Contact</h5>
                    <p>Email: info@uplingo.com.np</p>
                    <p>Phone: +977 9847847942</p>
                </div>
                <div style={sectionStyle}>
                    <h5>Follow Us</h5>
                    <p>Facebook | Twitter | Instagram</p>
                </div>
            </div>
            <div style={copyrightStyle}>
                <p>&copy; {new Date().getFullYear()} rajdoot. All rights reserved.</p>
            </div>
        </footer>
    );
};

const linkStyle = {
    color: "#fff",
    textDecoration: "none",
    marginRight: "15px",
    display: "block",
    marginBottom: "8px",
};

const footerStyle = {
    // position: 'fixed',
    backgroundColor: "gray",
    width: "100%",
    color: "white",
    textAlign: "center",
    // bottom: '10px',
};

const containerStyle = {
    backgroundColor: "#4caf50",
    paddingTop: "10px",
    display: "flex",
    justifyContent: "space-around",
    margin: "0 auto",
    flexWrap: "wrap",
};

const sectionStyle = {
    flex: "1",
    margin: "10px",
    minWidth: "200px",
};

const copyrightStyle = {
    borderTop: "1px solid #444",
    paddingTop: "10px",
};

export default Footer;
