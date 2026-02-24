package com.edubridge.vaultservice.config;

import org.flywaydb.core.Flyway;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;

@Component
public class FlywayMigrationInitializer implements BeanPostProcessor {

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof LocalContainerEntityManagerFactoryBean) {
            LocalContainerEntityManagerFactoryBean entityManagerFactoryBean = (LocalContainerEntityManagerFactoryBean) bean;
            DataSource dataSource = entityManagerFactoryBean.getDataSource();
            if (dataSource != null) {
                Flyway.configure()
                        .dataSource(dataSource)
                        .baselineOnMigrate(true)
                        .locations("classpath:db/migration")
                        .load()
                        .migrate();
            }
        }
        return bean;
    }
}
