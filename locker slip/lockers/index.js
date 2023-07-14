{
    const locker_slip_template = `<html lang="en">
    <head>
        <title>Locker Slip</title>
        <style>
            html {
                width: 500px;
                background-color: white;
                font-size: 1.5em;
            }
            #box {
                border: 10px solid black;
            }
            h2 {
                text-align: center;
            }
            tr {
                height: 3em;
            }
            td {
                font-size: 1.2em;
            }
            td + td {
                padding-left: 0.5em;
            }
            h5 {
                text-align: center;
                margin: 0;
            }
            strong{
                background-color: blue;
                color: white;
            }
            table {
                margin: auto;
                padding: 0.5em;
                font-size: inherit;
                font-weight: bold;
            }
            hr {
                display: block;
                height: 10px;
                background: black;
                width: 100%;
                margin: 1em 0;
                border: none;
            }
            img {
                display: block;
                height: 150px;
                margin: auto;
                max-width: 100%;
            }
        </style>
    </head>
    <body contenteditable>
        .
        <br>
        <br>
        <div id="box">
            <img src="">
        
            <hr>
            <table>
                <tr>
                    <td>LOCKER:</td>
                    <td id="locker_number"></td>
                </tr>
                <tr>
                    <td>GUEST:</td>
                    <td>{guest}</td>
                </tr>
                <tr>
                    <td>BILL:</td>
                    <td>{bill_number}</td>
                </tr>
                <tr>
                    <td>TOTAL:</td>
                    <td>€ {total}</td>
                </tr>
                <tr>
                    <td>PAID UNTIL:</td>
                    <td>{paid_until}</td>
                </tr>
            </table>
        </div>
    </body>
    </html>`;
    
    /** @type {HTMLElement} */    
    let container = document.getElementById("locker_slip_print");
    if (container === null) {
        container = document.createElement("div");
        container.id = "locker_slip_print";
        container.style.zIndex = 10001;
        container.style.position = "fixed";
        container.style.height = "100vh";
        container.style.width = "100vw";
        container.style.display = "flex";
        container.style.justifyContent = "center";
        container.style.alignItems = "stretch";
        container.style.visibility = "hidden";
        document.body.appendChild(container);
        
        const backdrop = document.createElement("div");
        backdrop.style.backgroundColor = "gray";
        backdrop.style.opacity = 0.5;
        backdrop.style.flexGrow = 1;
        backdrop.onclick = () => container.style.visibility = "hidden";
        container.appendChild(backdrop);
    
        const iframe_container = document.createElement("div");
        iframe_container.style.display = "flex";
        iframe_container.style.flexBasis = "515px";
        iframe_container.style.flexDirection = "column";
    
        {
            const iframe = document.createElement("iframe");
            iframe.style.flexGrow = "1";
            iframe_container.appendChild(iframe);
    
            const button = document.createElement("button");
            button.innerText = "Print";
            button.style.fontSize = "2em";
            button.style.padding = "0.5em";
            button.onclick = () => {
                const locker_number = iframe.contentDocument.getElementById("locker_number");
                if (locker_number.outerText === "") {
                    locker_number.focus();
                    alert("Please, write the locker number");
                    return;
                };
                iframe.contentWindow.print();
            };
            iframe_container.appendChild(button);
        };
        container.appendChild(iframe_container);
    
        const backdrop_clone = backdrop.cloneNode();
        backdrop_clone.onclick = () => container.style.visibility = "hidden";
        container.appendChild(backdrop_clone);
    
    
        document.addEventListener("keydown", event => {
            if (event.key !== "Escape") return;
            container.style.visibility = "hidden";
        }, true);
    };
    
    /**
     * Extracting data
     */
    
    /**
     * Get total and days of lockers
    */
    /** @type {HTMLElement[]} */
    const items = Array.from(document.querySelectorAll("[class^='item']"))
                .filter(item => item.firstElementChild.outerText.startsWith("Locker")); /* Used to detect "Lockers" and "Locker / Safe" */
    let days_paid = 0;
    let total = 0;
    items.forEach(item => {
        const quantity = parseInt(item.querySelector("td:nth-child(3)")
                                            .outerText
                                            .split("×")[0]);             
        const subtotal = parseFloat(item.querySelector("td:last-child")
                                        .outerText
                                        .substr(1));
        days_paid += quantity;
        total += subtotal;
    });
    const paid_until = (new Date((new Date()).setDate((new Date()).getDate() + days_paid)))
                            .toISOString()
                            .split("T")[0]
                            .split("-")
                            .reverse()
                            .join("/");
    
    /**
     * get bill number and guest's name
     */
    const bill_number = document.querySelector("[id^=heading] h2").outerText.split(' ').at(-1);
    const guest = document.querySelector('[data-test-id="customer-name-modal-opener"] span').closest("a").outerText.trim();
    
    
    /**
     * embedding data into template
     */
    const locker_slip = locker_slip_template
                            .replace("{guest}", guest)
                            .replace("{bill_number}", bill_number)
                            .replace("{total}", total)
                            .replace("{paid_until}", paid_until);
    
    container.style.visibility = "visible";
    const iframe = container.querySelector("iframe");
    iframe.contentDocument.open();
    iframe.contentDocument.write(locker_slip);
    const locker_number = iframe.contentDocument.getElementById("locker_number");
    locker_number.focus();
    
    iframe.contentDocument.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        container.style.visibility = "hidden";
    }, true);
}
/* made by github.com/madacol */
