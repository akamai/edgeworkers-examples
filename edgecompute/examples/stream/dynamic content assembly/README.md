# html-rewriter

*Keyword(s):* html-rewriter, dynamic content assembly<br>

In this example, we leverage EdgeWorkers html-rewriter to efficiently generate dynamic HTML content by combining JSON data from an API endpoint with an HTML template. 
Additionally, if the request is made by a logged-in user, a discount code will be dynamically incorporated into the rendered document. 
By performing these operations at the Edge with EdgeWorkers, we enhance site performance, offload server resources, and unlock SEO advantages. 
Furthermore, the template, JSON data, and rendered content can all be efficiently cached at the Edge, further optimizing response times and optimizing the overall site experience.

Template Before the EdgeWorker Runs:
````
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Akamai Coffee</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="menu">
    <main>
        <h1>Akamai Menu</h1>
        <hr>
        <section>
        </section>
    </main>
</div>
</body>
</html>

````

Generated Content After the EdgeWorker Runs:
````
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Akamai Coffee</title>
    <link rel="stylesheet" href="/styles.css">
</head>
<body>
<div class="menu">
    <main>
        <h1>Akamai Coffee</h1>
        <hr>
        <section>
            <h2>Coffee Menu</h2>
            <article class="item">
                <p class="coffee">Americano</p><p class="americano">$3.00</p>
            </article>
            <article class="item">
                <p class="coffee">Espresso</p><p class="espresso">$2.50</p>
            </article>
            <article class="item">
                <p class="coffee">Latte</p><p class="latte">$3.50</p>
            </article>
            <article class="item">
                <p class="coffee">Mocha</p><p class="mocha">$4.50</p>
            </article>
        </section>
    </main>
</div>
</body>
</html>
````

## Similar Uses

This example could be modified to support various use cases for dynamic content assembly at the Edge with EdgeWorkers.

## More details on EdgeWorkers
- [Akamai EdgeWorkers](https://techdocs.akamai.com/edgeworkers/docs)
- [Akamai EdgeWorkers Examples](https://www.edgecompute.live/)
