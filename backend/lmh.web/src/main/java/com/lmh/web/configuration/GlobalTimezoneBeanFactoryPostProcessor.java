package com.lmh.web.configuration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationEnvironmentPreparedEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.TimeZone;

@Component
public class GlobalTimezoneBeanFactoryPostProcessor implements ApplicationListener<ApplicationEnvironmentPreparedEvent> {

    @Override
    public void onApplicationEvent(ApplicationEnvironmentPreparedEvent event) {
        Environment environment = event.getEnvironment();
        String timezone = environment.getProperty("app.timezone", "UTC");
        TimeZone.setDefault(TimeZone.getTimeZone(timezone));
    }
}

