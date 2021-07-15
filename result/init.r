setwd(".")
rm(list = ls())
library(tidyverse)

df.OL <- read.csv("sv02_total.csv")

# translate integer
df.OL$rt <- as.double(levels(as.factor(df.OL$rt))[as.factor(df.OL$rt)])
df.OL$acc <- as.integer(df.OL$acc)

# filter data needed
## calculation mean of RT and Acc
ra_mean <- df.OL %>%
    dplyr::filter(
        blockType == "formal",
        rt != "null"
    ) %>%
    dplyr::mutate(
        hit = ifelse(acc == 1 & condition == "match", 1, 0), # hit
        cr = ifelse(acc == 1 & condition != "match", 1, 0), # correct rejection
        miss = ifelse(acc == 0 & condition == "match", 1, 0), # miss
        fa = ifelse(acc == 0 & condition != "match", 1, 0) # false alarm
    ) %>%
    dplyr::group_by(
        index, series, condition, misNum, shapeNameEn, characterNameEn
    ) %>%
    dplyr::summarise(
        rt = mean(rt, na.rm = T),
        acc = mean(acc, na.rm = T)
    )

## calculation the D-prime
dprime <- df.OL %>%
    dplyr::filter(
        blockType == "formal",
        rt != "null"
    ) %>%
    dplyr::mutate(
        hit = ifelse(acc == 1 & condition == "match", 1, 0), # hit
        cr = ifelse(acc == 1 & condition != "match", 1, 0), # correct rejection
        miss = ifelse(acc == 0 & condition == "match", 1, 0), # miss
        fa = ifelse(acc == 0 & condition != "match", 1, 0) # false alarm
    ) %>%
    dplyr::group_by(
        index, series, misNum, shapeNameEn, characterNameEn
    ) %>%
    dplyr::summarise(
        hit = sum(hit),
        fa = sum(fa),
        miss = sum(miss),
        cr = sum(cr),
        hitP = ifelse(hit / (hit + miss) < 1 & hit / (hit + miss) > 0,
            hit / (hit + miss),
            1 - 1 / (2 * (hit + miss))
        ),
        faP = ifelse(fa / (fa + cr) > 0 & fa / (fa + cr) < 1,
            fa / (fa + cr),
            1 / (2 * (fa + cr))
        ),
        dPrime = qnorm(hitP) - qnorm(faP)
    )
## merge
df.analysis <- ra_mean %>%
  dplyr::mutate(
    dPrime = dprime$dPrime[
      dprime$index == index &
        dprime$series == series &
        dprime$misNum == misNum &
        ((is.na(dprime$shapeNameEn) & dprime$characterNameEn == characterNameEn) |
           (is.na(dprime$characterNameEn) & dprime$shapeNameEn == shapeNameEn))
    ]
  )
rm("dprime", "ra_mean")
# base info
df.OL.basic <- df.OL %>%
    dplyr::select(index, Sex, BirthYear, Education) %>%
    dplyr::distinct(index, Sex, BirthYear) %>%
    dplyr::summarise(
        subj_N = length(index),
        female_N = sum(Sex == "female"),
        male_N = sum(Sex == "male"),
        Age_mean = round(mean(2021 - BirthYear), 2),
        Age_sd = round(sd(2021 - BirthYear), 2)
    )
