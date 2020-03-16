import cheerio from "cheerio";
import { assert } from "console";
import request, { RequestPromise } from "request-promise";

interface IDividend {
    company: string;
    yieldInPercent: string;
    dividend: string;
    currency: string;
    year: number;
}

const main = async (companyName: string) => {
    try {
        const dividendPage = await getDividendPageHtml(companyName);
        const $ = parsePage(dividendPage);
        const dividendTable = getDividendTable(companyName, $);
        const dividends = getDividends(dividendTable);
        console.log({ dividends });
    } catch (error) {
        console.error("ERROR: ", error.message, error.stack);
    }
};

const getDividends = (dividendTable: Cheerio) => {
    const dividends: IDividend[] = [];
    const rows = dividendTable.find("tr");
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rowArray = row.children.map(td => td.children[0].data);
        dividends.push({
            company: rowArray[0],
            yieldInPercent: rowArray[1],
            dividend: rowArray[2],
            currency: rowArray[3],
            year: Number.parseInt(rowArray[4]),
        });
    }
    return dividends;
};

const getDividendPageHtml = (companyName: string): RequestPromise<string> =>
    request(`https://www.finanzen.net/dividende/${companyName.toLowerCase()}`, {
        method: "GET",
        followRedirect: false,
    });

const parsePage = (page: string) =>
    cheerio.load(page, {
        normalizeWhitespace: true,
    });

const getDividendTable = (companyName: string, $: CheerioStatic) => {
    const tableHeaders = $(".table-quotes").find(
        `h2:contains("${companyName} Aktie Dividende")`
    );
    assert(tableHeaders.length === 1, "Dividend table not unique");
    return tableHeaders.parent();
};

// main("HeidelbergCement");
main("Siemens");
