source("init.r", encoding = "UTF-8")

day1.ANOVA.data <- df.Analysis %>% 
  dplyr::filter(
    series == 1
  )

day1.ANOVA.rt <-  aov(rt ~ characterNameEn * misNum, day1.ANOVA.data) %>% 
  summary()

day0.ANOVA.data <- df.Analysis %>% 
  dplyr::filter(
    series == 0
  )

day0.ANOVA.rt <-  aov(rt ~ shapeNameEn * misNum, day0.ANOVA.data) %>% 
  summary()
