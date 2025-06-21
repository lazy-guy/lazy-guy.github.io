---
title: Creating a timezone-aware clock without any JS
layout: blogpost
permalink: /blog/clock/
tags: post
thumb: /imgs/clock-nojs.png
date: 2025-06-21
weblink: https://clock-nojs.vercel.app/
github: https://github.com/lazy-guy/clock-nojs/
---

## Clocking In

Three years ago, back in 2022, when I was still learning the basics of CSS and JS, I decided to make a simple <a target="_blank" href="https://github.com/lazy-guy/clock">analog clock</a>.

It still works quite well. It uses CSS for all the layouts and second markers. But the rotation of the clock hands is updated by JavaScript every second.

So now, I decided to update this mini project by getting rid of all that JavaScript, making it a purely HTML and CSS-based clock &mdash; atleast on the client side.

## Animating the clock hands

Making the clock hands spin is pretty easy; CSS animations can handle it quite well.

```css
@keyframes clockspin {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

#secondhand {
	animation: clockspin 60s linear infinite; /* 60s = 1 Minute */
}

#minutehand {
	animation: clockspin 3600s linear infinite; /* 3600s = 1 Hour */
}

#hourhand {
	animation: clockspin 43200s linear infinite; /* 43200s = 12 Hours */
}
```

But there's a problem: each time the page loads, the clock restarts from 00:00:00 with all the hands pointing at 12. It's not synced to the real clock.

## Syncing the clock with the real world

One way to do this is by using the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay">`animation-delay`</a> property.

Let's assume that the current time is 10:10:10. This means:

-   Hour hand should indicate 10 Hours
-   Minute hand should indicate 10 Minutes
-   Second hand should indicate 10 seconds

One neat trick is to use a negative value for <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay">`animation-delay`</a>. This starts the animation at an arbitrary point of the animation timeline. Positive values delay the animation, while negative values advance the animation.

```css
#secondhand {
	animation: clockspin 60s linear infinite;
	animation-delay: -10s; /* 10s =  10 Seconds */
}

#minutehand {
	animation: clockspin 3600s linear infinite;
	animation-delay: -600s; /* 600s = 10 Minutes */
}

#hourhand {
	animation: clockspin 43200s linear infinite;
	animation-delay: -36000s; /* 36000s = 10 Hours */
}
```

Now, the clock should start from 10:10:10!

In order to sync it with current time, we need to use some server-side modifications in the <a target="_blank" href="https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay">`animation-delay`</a> values.

I'm using Jinja2 with FastAPI, but this can be done with any language or templating engine of your choice.

For Jinja2, it will look something like this:

```css
#secondhand {
	animation: clockspin 60s linear infinite;
	animation-delay: -{{ secondHandDelay }}s;
}

#minutehand {
	animation: clockspin 3600s linear infinite;
	animation-delay: -{{ minuteHandDelay }}s;
}

#hourhand {
	animation: clockspin 43200s linear infinite;
	animation-delay: -{{ hourHandDelay }}s;
}
```

```python
@app.get("/", response_class=HTMLResponse)
async def showtime():
    currenttime = datetime.now()
    
    secondHandDelay = currenttime.second
    minuteHandDelay = currenttime.minute * 60
    hourHandDelay = (currenttime.hour % 12) * 3600 + minuteHandDelay

    return templates.TemplateResponse(
        request=request,
        name="mytemplate.html",
        context={
            "secondHandDelay": secondHandDelay,
            "minuteHandDelay": minuteHandDelay,
            "hourHandDelay": hourHandDelay,
        },
    )
```

Now, the clock displays the correct time!


But there is one small problem: What if I host this on a web server and someone tries to view this clock?

The user will see the time according to the timezone set on the server machine, and not the one set on their device. 

This is the biggest drawback of not using any client-side JavaScript - you lose the information about the timezone set on the user's device.


Is there any way to make it timezone-aware?

## Using IP Address Geolocation

<a target="_blank" href="https://datatracker.ietf.org/doc/html/draft-sharhalakis-httptz">We cannot get the user's timezone directly with the request</a>, but we do get their IP address.

We can try to map the user's IP address to their country/city. Then, we can determine which timezone to use!

I decided to use the <a target="_blank" href="https://data.public.lu/en/datasets/geo-open-ip-address-geolocation-per-country-in-mmdb-format/">Geo Open database</a>, but MaxMind's databases should offer better accuracy, with the caveat of a different license.

These databases are available in the <a target="_blank" href="https://maxmind.github.io/MaxMind-DB/">MaxMind DB (mmdb) Format</a>.

I'm using the <a target="_blank" href="https://github.com/maxmind/MaxMind-DB-Reader-python">MaxMind DB Python Module</a> to query the database, and the <a target="_blank" href="https://pypi.org/project/pytz/">pytz module</a> to map the country code to its timezone.

```python
db = maxminddb.open_database("2025-05-26-GeoOpen-Country.mmdb")

def get_country(ip: str) -> str | None:
    try:
        country = db.get(ip)
        if country and "country" in country:
            return country["country"]["iso_code"]
        return None
    except Exception as e:
        print(f"Error retrieving country for IP {ip}: {e}")
        return None

@app.get("/", response_class=HTMLResponse)
async def showtime(request: Request):
    # Get client's IP address
    client = request.client.host
    client_country = get_country(client)
    client_timezone = country_timezones.get(country, ["UTC"])[0]

    currenttime = datetime.now(timezone(clientTimezone))
    
    secondHandDelay = currenttime.second
    minuteHandDelay = currenttime.minute * 60
    hourHandDelay = (currenttime.hour % 12) * 3600 + minuteHandDelay

    print(secondHandDelay, minuteHandDelay, hourHandDelay)

    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={
            "timezones": all_timezones,
            "selected": clientTimezone,
            "secondHandDelay": secondHandDelay,
            "minuteHandDelay": minuteHandDelay,
            "hourHandDelay": hourHandDelay,
        },
    )
```

This works well, but there are some obvious limitations.
- IP address geolocation is not 100% accurate.
- The Geo Open database only provides the country information, not timezone. If the country follows multiple timezones based on the region, it might provide incorrect results.
	- However, the MaxMind GeoIP and GeoLite City databases provide timezone information as well. Using that should improve accuracy.


## Finishing it off

You can check the final result <a target="_blank" href="https://clock-nojs.vercel.app">here</a>. The source code is available <a target="_blank" href="https://github.com/lazy-guy/clock-nojs">here</a>.

I have also added a custom timezone selector, in case the IP address geolocation fails to provide correct results. 

It still works without any client-side JavaScript, which I find pretty cool.